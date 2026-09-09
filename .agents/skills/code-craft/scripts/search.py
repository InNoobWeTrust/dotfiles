#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "rank-bm25>=0.2.2",
# ]
# ///
# -*- coding: utf-8 -*-
"""
Code Craft Pattern Search Engine
Lightweight design pattern, architecture, and code guardrail search for AI coding agents.

Usage:
  ./search.py "<query>" [--domain <domain>] [--stack <stack>] [--max-results 3]
  uv run search.py "<query>"
  python3 search.py "<query>"
  ./search.py "<problem requirements>" --decide
  ./search.py --traps [--model <claude|gpt|gemini>] [--stack <stack>]
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
    "patterns": "design-patterns.csv",
    "concurrency": "resilience.csv",
    "traps": "model-traps.csv",
    "reasoning": "code-reasoning.csv",
    "stacks": "stacks.csv",
}

DOMAIN_ALIASES = {
    "pattern": "patterns",
    "patterns": "patterns",
    "design": "patterns",
    "code": "patterns",
    "concurrency": "concurrency",
    "resilience": "concurrency",
    "async": "concurrency",
    "traps": "traps",
    "model-traps": "traps",
    "models": "traps",
    "reason": "reasoning",
    "reasoning": "reasoning",
    "decide": "reasoning",
    "decision": "reasoning",
    "stack": "stacks",
    "stacks": "stacks",
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

    def __init__(self, records: List[Dict[str, str]], text_fields: Optional[List[str]] = None):
        self.records = records
        self.tokenized_docs: List[List[str]] = []
        for record in records:
            if text_fields:
                combined_text = " ".join(record.get(f, "") for f in text_fields)
            else:
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
            name = record.get("name", record.get("pattern_name", "")).lower()
            rec_id = record.get("id", "").lower()
            if q_clean in name or q_clean in rec_id:
                score += 5.0

            if score > 0.0:
                scores.append((score, record))

        scores.sort(key=lambda x: x[0], reverse=True)
        return scores


def search_domain(domain_name: str, query: str, stack: Optional[str] = None, model: Optional[str] = None, max_results: int = 3) -> List[Dict[str, Any]]:
    """Search a single domain with optional stack/model filters."""
    domain_key = DOMAIN_ALIASES.get(domain_name.lower(), domain_name.lower())
    csv_file = DOMAINS.get(domain_key)
    if not csv_file:
        return []

    records = load_csv(csv_file)
    if not records:
        return []

    def record_filter(rec: Dict[str, str]) -> bool:
        if stack:
            s_val = rec.get("stack", "") or rec.get("domain_or_lang", "") or rec.get("key_components", "")
            if s_val and stack.lower() not in s_val.lower():
                if "stack" in rec:
                    return False
        if model and "model_family" in rec:
            m_val = rec.get("model_family", "")
            if m_val and model.lower() not in m_val.lower() and m_val != "general":
                return False
        return True

    index = BM25Index(records)
    results = index.score(query, filter_fn=record_filter)
    return [item[1] for item in results[:max_results]]


def search_all(query: str, stack: Optional[str] = None, model: Optional[str] = None, max_results_per_domain: int = 2) -> Dict[str, List[Dict[str, Any]]]:
    """Search across all pattern domains."""
    output = {}
    for domain in ["patterns", "stacks", "concurrency", "traps", "reasoning"]:
        matches = search_domain(domain, query, stack=stack, model=model, max_results=max_results_per_domain)
        if matches:
            output[domain] = matches
    return output


def format_record(domain: str, rec: Dict[str, str]) -> str:
    """Format an individual record into token-optimized markdown."""
    lines = []
    rec_id = rec.get("id", "pattern")
    name = rec.get("name", rec.get("pattern_name", rec_id))

    if domain == "patterns":
        lines.append(f"### [Code Pattern] {name} (`{rec_id}`)")
        lines.append(f"- **Category:** {rec.get('category', '')}")
        lines.append(f"- **Intent:** {rec.get('intent', '')}")
        lines.append(f"- **Modern Alternative:** {rec.get('modern_alternative', '')}")
        lines.append(f"- **When to Use:** {rec.get('when_to_use', '')}")
        lines.append(f"- **Anti-patterns:** {rec.get('anti_patterns', '')}")

    elif domain in ("resilience", "concurrency"):
        lines.append(f"### [Concurrency / Resilience] {name} (`{rec_id}`)")
        lines.append(f"- **Failure Mode:** {rec.get('failure_mode', '')}")
        lines.append(f"- **Strategy:** {rec.get('strategy', '')}")
        lines.append(f"- **Recommended Tuning:** {rec.get('recommended_params', '')}")
        lines.append(f"- **Pitfalls:** {rec.get('pitfalls', '')}")
        if rec.get("canonical_snippet"):
            lines.append(f"```text\n{rec.get('canonical_snippet')}\n```")

    elif domain == "stacks":
        stack = rec.get("stack", "").upper()
        lines.append(f"### [{stack} Blueprint] {name} (`{rec_id}`)")
        lines.append(f"- **Best Practices:** {rec.get('best_practices', '')}")
        lines.append(f"- **Prohibited Idioms:** {rec.get('prohibited_idioms', '')}")
        if rec.get("canonical_snippet"):
            lines.append(f"```{rec.get('stack', '')}\n{rec.get('canonical_snippet')}\n```")

    elif domain == "traps":
        model_family = rec.get("model_family", "all").upper()
        lines.append(f"### [Trap: {model_family}] {rec.get('trap_description', name)} (`{rec_id}`)")
        lines.append(f"- **Language / Scope:** {rec.get('domain_or_lang', '')}")
        lines.append(f"- **Bad Habit:** `{rec.get('bad_example', '')}`")
        lines.append(f"- **Remediation Rule:** {rec.get('remediation_rule', '')}")

    elif domain == "reasoning":
        lines.append(f"### [Decision Rule] {rec.get('problem_type', name)} (`{rec_id}`)")
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
    parser = argparse.ArgumentParser(description="Code Craft Pattern Search")
    parser.add_argument("query", nargs="?", default="", help="Search query or requirements description")
    parser.add_argument("--domain", "-d", choices=list(DOMAIN_ALIASES.keys()), help="Filter by specific pattern domain")
    parser.add_argument("--stack", "-s", help="Filter by language or technology stack (e.g. go, rust, python, typescript)")
    parser.add_argument("--model", "-m", help="Target model family for trap checks (claude, gpt, gemini)")
    parser.add_argument("--max-results", "-n", type=int, default=3, help="Max results to display")
    parser.add_argument("--decide", action="store_true", help="Shortcut to evaluate architecture decision rules")
    parser.add_argument("--traps", action="store_true", help="Shortcut to display model anti-pattern traps")
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
        results = search_domain(canonical_domain, args.query, stack=args.stack, model=args.model, max_results=args.max_results)
        grouped_results = {canonical_domain: results} if results else {}
    else:
        grouped_results = search_all(args.query, stack=args.stack, model=args.model, max_results_per_domain=args.max_results)

    if args.json:
        print(json.dumps(grouped_results, indent=2))
        return

    # Render formatted markdown
    total_found = sum(len(items) for items in grouped_results.values())
    if total_found == 0:
        print(f"## Code Craft: No exact pattern match found for query: '{args.query}'")
        print("Tip: Broaden your search terms or search without specific domain/stack constraints.")
        return

    print("## Code Craft — Recommended Patterns\n")
    if args.query:
        print(f"> **Query:** `{args.query}`" + (f" | **Stack:** `{args.stack}`" if args.stack else "") + (f" | **Model:** `{args.model}`" if args.model else "") + "\n")

    for domain, records in grouped_results.items():
        for rec in records:
            print(format_record(domain, rec))
            print()


if __name__ == "__main__":
    main()
