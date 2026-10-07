# /// script
# requires-python = ">=3.10"
# dependencies = ["rank-bm25>=0.2.2"]
# ///
"""Retrieve at most three principle candidates; the caller judges their fit."""

import argparse
import csv
import json
import re
from pathlib import Path

from rank_bm25 import BM25Plus

CATALOG = Path(__file__).resolve().parents[1] / "catalog.csv"
POSITIVE_FIELDS = ("id", "use_when", "perspective")
STOP_WORDS = frozenset("a an and are as at be by for from in is it of on or the this to with".split())


def tokenize(text):
    return [word for word in re.findall(r"[a-z0-9]+", text.lower())
            if len(word) > 1 and word not in STOP_WORDS]


def load_catalog(path=CATALOG):
    with path.open(encoding="utf-8", newline="") as source:
        return list(csv.DictReader(source))


def rank(rows, query, max_results=3):
    terms = tokenize(query)
    if not terms or not rows:
        return []
    documents = [tokenize(" ".join(row[field] for field in POSITIVE_FIELDS)) for row in rows]
    scores = BM25Plus(documents).get_scores(terms)
    # BM25Plus gives nonmatching documents a positive baseline. Require overlap.
    candidates = [index for index, document in enumerate(documents) if set(terms).intersection(document)]
    exact_id = query.strip().lower()
    candidates.sort(key=lambda index: (rows[index]["id"] == exact_id, scores[index]), reverse=True)
    return [rows[index] for index in candidates[:max_results]]


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query", nargs="?", help="Describe the task and needed judgment")
    parser.add_argument("--id", help="Retrieve one known principle ID without ranking")
    parser.add_argument("--max-results", type=int, choices=(1, 2, 3), default=3)
    parser.add_argument("--json", action="store_true", help="Emit candidate rows as JSON")
    arguments = parser.parse_args(argv)
    if (arguments.query is None) == (arguments.id is None):
        parser.error("Supply a query or --id, not both")
    rows = load_catalog()
    if arguments.id is not None:
        matches = [row for row in rows if row["id"] == arguments.id]
        if not matches:
            parser.error(f"Unknown principle ID: {arguments.id}")
    else:
        matches = rank(rows, arguments.query, arguments.max_results)
    if arguments.json:
        print(json.dumps(matches, ensure_ascii=False, indent=2))
    elif not matches:
        print("No matching candidates. Use the baseline or refine the task query.")
    else:
        for row in matches:
            print(f"## {row['id']}\nUse when: {row['use_when']}\nAvoid when: {row['avoid_when']}"
                  f"\nPerspective: {row['perspective']}\nReference: {row['reference']}\n")


if __name__ == "__main__":
    main()
