#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "rank-bm25>=0.2.2",
# ]
# ///
# -*- coding: utf-8 -*-
"""Retrieve at most five persona candidates; the caller judges their fit.

Usage:
  ./search_personas.py "<topic or lens needed>" [--group <group>]
  uv run --script scripts/search_personas.py "<query>"
  ./search_personas.py --id <persona-id>
  ./search_personas.py --list-groups
"""

import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path

try:
    from rank_bm25 import BM25Plus
except ImportError:
    sys.exit(
        "Error: 'rank-bm25' library is required.\n"
        "Please execute via 'uv run --script <script>' or './<script>'"
        " so uv automatically loads dependencies."
    )

# Ensure UTF-8 output across environments
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

CATALOG = Path(__file__).resolve().parents[1] / "assets/personas.csv"
POSITIVE_FIELDS = ("id", "name", "group", "domain", "use_when")
STOP_WORDS = frozenset("a an and are as at be by for from in is it of on or the this to with".split())


def tokenize(text):
    return [word for word in re.findall(r"[a-z0-9]+", (text or "").lower())
            if len(word) > 1 and word not in STOP_WORDS]


def load_catalog(path=CATALOG):
    with path.open(encoding="utf-8", newline="") as source:
        return list(csv.DictReader(source))


def rank(rows, query, max_results=3):
    terms = tokenize(query)
    if not terms or not rows:
        return []
    documents = [tokenize(" ".join(row.get(field, "") for field in POSITIVE_FIELDS)) for row in rows]
    scores = BM25Plus(documents).get_scores(terms)
    # BM25Plus gives nonmatching documents a positive baseline. Require overlap.
    candidates = [index for index, document in enumerate(documents) if set(terms).intersection(document)]
    exact_id = query.strip().lower()
    candidates.sort(key=lambda index: (rows[index]["id"] == exact_id, scores[index]), reverse=True)
    return [rows[index] for index in candidates[:max_results]]


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query", nargs="?", help="Describe the topic and lens needed")
    parser.add_argument("--id", help="Retrieve one known persona ID without ranking")
    parser.add_argument("--group", help="Restrict to one persona group (case-insensitive)")
    parser.add_argument("--list-groups", action="store_true", help="List persona groups with counts")
    parser.add_argument("--max-results", type=int, choices=(1, 2, 3, 4, 5), default=3)
    parser.add_argument("--json", action="store_true", help="Emit candidate rows as JSON")
    args = parser.parse_args(argv)
    rows = load_catalog()
    if args.list_groups:
        counts = {}
        for row in rows:
            counts[row.get("group", "?")] = counts.get(row.get("group", "?"), 0) + 1
        for group in sorted(counts):
            print(f"{group}: {counts[group]}")
        return
    if args.group:
        rows = [r for r in rows if r.get("group", "").lower() == args.group.lower()]
        if not rows:
            parser.error(f"Unknown persona group: {args.group}")
    if (args.query is None) == (args.id is None):
        parser.error("Supply a query or --id, not both")
    if args.id is not None:
        matches = [row for row in rows if row["id"] == args.id]
        if not matches:
            parser.error(f"Unknown persona ID: {args.id}")
    else:
        matches = rank(rows, args.query, args.max_results)
    if args.json:
        print(json.dumps(matches, ensure_ascii=False, indent=2))
    elif not matches:
        print("No matching candidates. Broaden the query or list groups with --list-groups.")
    else:
        for row in matches:
            print(f"## {row['id']} ({row['name']} · {row['group']} · {row['domain']})\n"
                  f"Use when: {row['use_when']}\nReference: {row['reference']}\n")


if __name__ == "__main__":
    main()
