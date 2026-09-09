#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "rank-bm25>=0.2.2",
# ]
# ///
# -*- coding: utf-8 -*-
"""
Database Design Pattern Search Engine
Lightweight operational schema modeling, indexing, and migration search for AI coding agents.

Usage:
  ./search.py "<query>" [--domain <domain>] [--max-results 3]
  uv run search.py "<query>"
  python3 search.py "<query>"
  ./search.py "<requirements>" --decide
  ./search.py --traps
"""

import argparse
import csv
import io
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    from rank_bm25 import BM25Plus
except ImportError:
    sys.exit(
        "Error: 'rank-bm25' library is required.\n"
        "Please execute via 'uv run <script>' or './<script>' so uv automatically loads dependencies."
    )

# Ensure UTF-8 output across environments
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

DATA_DIR = Path(__file__).resolve().parent / "data"

DOMAINS = {
    "schema": "schema.csv",
    "indexing": "indexing.csv",
    "migrations": "migrations.csv",
    "traps": "db-traps.csv",
    "reasoning": "db-reasoning.csv",
}

DOMAIN_ALIASES = {
    "schema": "schema",
    "modeling": "schema",
    "model": "schema",
    "pk": "schema",
    "keys": "schema",
    "index": "indexing",
    "indexes": "indexing",
    "indexing": "indexing",
    "migration": "migrations",
    "migrations": "migrations",
    "evolution": "migrations",
    "trap": "traps",
    "traps": "traps",
    "anti-patterns": "traps",
    "reason": "reasoning",
    "reasoning": "reasoning",
    "decide": "reasoning",
    "decision": "reasoning",
}


def tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase alphanumeric tokens."""
    if not text:
        return []
    return re.findall(r"\b[a-zA-Z0-9_\-]{2,}\b", text.lower())


def load_csv(filename: str) -> List[Dict[str, str]]:
    """Load records from a data CSV file."""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        return []
    records = []
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append({str(k).strip(): (str(v).strip() if v is not None else "") for k, v in row.items() if k is not None})
    return records


class BM25Index:
    """In-memory search index powered by the established rank_bm25 library."""

    def __init__(self, records: List[Dict[str, str]]):
        self.records = records
        self.tokenized_docs: List[List[str]] = []
        for record in records:
            combined_text = " ".join(record.values())
            self.tokenized_docs.append(tokenize(combined_text))

        self.model = BM25Plus(self.tokenized_docs) if self.tokenized_docs else None

    def score(self, query: str, filter_fn=None) -> List[Tuple[float, Dict[str, str]]]:
        """Score and rank records using rank_bm25.BM25Plus."""
        if not self.records or not self.model:
            return []

        query_tokens = tokenize(query)
        if not query_tokens:
            return [(1.0, r) for r in self.records if (not filter_fn or filter_fn(r))]

        raw_scores = self.model.get_scores(query_tokens)
        q_clean = query.lower().strip()

        scores: List[Tuple[float, Dict[str, str]]] = []
        for i, raw_score in enumerate(raw_scores):
            record = self.records[i]
            if filter_fn and not filter_fn(record):
                continue

            score = float(raw_score)

            # Boost exact substring matches in ID or name
            name = record.get("name", record.get("pattern_name", record.get("trap_name", ""))).lower()
            rec_id = record.get("id", "").lower()
            if q_clean in name or q_clean in rec_id:
                score += 5.0

            if score > 0.0:
                scores.append((score, record))

        scores.sort(key=lambda x: x[0], reverse=True)
        return scores


def search_domain(domain_name: str, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    """Search a single database design domain."""
    domain_key = DOMAIN_ALIASES.get(domain_name.lower(), domain_name.lower())
    csv_file = DOMAINS.get(domain_key)
    if not csv_file:
        return []

    records = load_csv(csv_file)
    if not records:
        return []

    index = BM25Index(records)
    results = index.score(query)
    return [item[1] for item in results[:max_results]]


def search_all(query: str, max_results_per_domain: int = 2) -> Dict[str, List[Dict[str, Any]]]:
    """Search across all database design domains."""
    output = {}
    for domain in ["schema", "indexing", "migrations", "traps", "reasoning"]:
        matches = search_domain(domain, query, max_results=max_results_per_domain)
        if matches:
            output[domain] = matches
    return output


def format_record(domain: str, rec: Dict[str, str]) -> str:
    """Format an individual record into token-optimized markdown."""
    lines = []
    rec_id = rec.get("id", "pattern")
    name = rec.get("name", rec.get("trap_name", rec_id))

    if domain in ("schema", "indexing", "migrations"):
        lines.append(f"### [DB Pattern] {name} (`{rec_id}`)")
        lines.append(f"- **Category:** {rec.get('category', '')}")
        lines.append(f"- **When to Use:** {rec.get('when_to_use', '')}")
        lines.append(f"- **Avoid When:** {rec.get('avoid_when', '')}")
        lines.append(f"- **Rules & Specification:** {rec.get('rules_and_spec', '')}")
        lines.append(f"- **Trade-offs:** {rec.get('trade_offs', '')}")
        lines.append(f"- **Anti-patterns to Avoid:** {rec.get('anti_patterns', '')}")

    elif domain == "traps":
        lines.append(f"### [Database Trap] {rec.get('trap_name', name)} (`{rec_id}`)")
        lines.append(f"- **Scope:** {rec.get('scope', '')}")
        lines.append(f"- **Trap Description:** {rec.get('trap_description', '')}")
        lines.append(f"- **Bad Practice:** `{rec.get('bad_example', '')}`")
        lines.append(f"- **Remediation Rule:** {rec.get('remediation_rule', '')}")

    elif domain == "reasoning":
        lines.append(f"### [Database Decision] {rec.get('problem_type', name)} (`{rec_id}`)")
        lines.append(f"- **Criteria:** {rec.get('trigger_criteria', '')}")
        lines.append(f"- **Recommended:** `{rec.get('recommended_pattern', '')}` (vs Alternate: `{rec.get('alternate_pattern', '')}`)")
        lines.append(f"- **Rationale:** {rec.get('decision_rationale', '')}")

    else:
        lines.append(f"### [{domain.title()}] {name} (`{rec_id}`)")
        for k, v in rec.items():
            if k not in ("id", "name"):
                lines.append(f"- **{k.title()}:** {v}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Database Design Pattern Search")
    parser.add_argument("query", nargs="?", default="", help="Search query or requirements description")
    parser.add_argument("--domain", "-d", choices=list(DOMAIN_ALIASES.keys()), help="Filter by specific domain (schema, indexing, migrations, traps, reasoning)")
    parser.add_argument("--max-results", "-n", type=int, default=3, help="Max results to display")
    parser.add_argument("--decide", action="store_true", help="Shortcut to evaluate database decision rules")
    parser.add_argument("--traps", action="store_true", help="Shortcut to display database anti-pattern traps")
    parser.add_argument("--json", action="store_true", help="Output raw JSON instead of markdown")

    args = parser.parse_args()

    # Route shortcuts
    if args.decide:
        args.domain = "reasoning"
        if not args.query:
            args.max_results = 10
    elif args.traps:
        args.domain = "traps"
        if not args.query:
            args.max_results = 10

    if not args.query and not args.domain:
        parser.print_help()
        sys.exit(0)

    # Perform search
    if args.domain:
        canonical_domain = DOMAIN_ALIASES.get(args.domain.lower(), args.domain.lower())
        results = search_domain(canonical_domain, args.query, max_results=args.max_results)
        grouped_results = {canonical_domain: results} if results else {}
    else:
        grouped_results = search_all(args.query, max_results_per_domain=args.max_results)

    if args.json:
        print(json.dumps(grouped_results, indent=2))
        return

    # Render formatted markdown
    total_found = sum(len(items) for items in grouped_results.values())
    if total_found == 0:
        print(f"## Database Design: No exact match found for query: '{args.query}'")
        print("Tip: Broaden your search terms or search without specific domain constraints.")
        return

    print("## Database Design — Recommended Patterns\n")
    if args.query:
        print(f"> **Query:** `{args.query}`\n")

    for domain, records in grouped_results.items():
        for rec in records:
            print(format_record(domain, rec))
            print()


if __name__ == "__main__":
    main()
