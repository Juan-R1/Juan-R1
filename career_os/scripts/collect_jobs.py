#!/usr/bin/env python3
"""Normalize manually approved job CSV inputs into jobs_raw.csv.

This script does not scrape websites. Use it with exported CSVs, saved-search
email data converted to CSV, API outputs converted to CSV, or manually copied
job leads.
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DEFAULT = ROOT / "data" / "jobs_raw.csv"

FIELDNAMES = [
    "job_id",
    "source",
    "url",
    "company",
    "job_title",
    "location",
    "work_setup",
    "salary_min",
    "salary_max",
    "employment_type",
    "job_description",
    "required_qualifications",
    "preferred_qualifications",
    "tools_mentioned",
    "healthcare_requirements",
    "certifications_required",
    "years_experience",
    "application_deadline",
    "application_complexity",
    "easy_apply",
    "requires_account",
    "requires_sensitive_legal_answers",
]

ALIASES = {
    "title": "job_title",
    "job title": "job_title",
    "company name": "company",
    "link": "url",
    "source url": "url",
    "remote_hybrid_onsite": "work_setup",
    "salary minimum": "salary_min",
    "salary maximum": "salary_max",
    "description": "job_description",
}


def normalize_key(key: str) -> str:
    cleaned = key.strip().lower().replace("-", " ").replace("_", " ")
    return ALIASES.get(cleaned, cleaned.replace(" ", "_"))


def dedupe_key(row: dict[str, str]) -> tuple[str, str, str, str]:
    return (
        row.get("company", "").strip().lower(),
        row.get("job_title", "").strip().lower(),
        row.get("location", "").strip().lower(),
        row.get("url", "").strip().lower(),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize approved job lead CSVs.")
    parser.add_argument("inputs", nargs="+", help="Input CSV file(s)")
    parser.add_argument("--output", default=str(OUTPUT_DEFAULT))
    parser.add_argument("--source", default="")
    args = parser.parse_args()

    rows: dict[tuple[str, str, str, str], dict[str, str]] = {}
    counter = 1
    for input_file in args.inputs:
        with open(input_file, newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            for raw in reader:
                normalized = {field: "" for field in FIELDNAMES}
                for key, value in raw.items():
                    mapped = normalize_key(key)
                    if mapped in normalized:
                        normalized[mapped] = value or ""
                normalized["source"] = normalized["source"] or args.source or Path(input_file).stem
                normalized["job_id"] = normalized["job_id"] or f"JOB-{counter:04d}"
                counter += 1
                rows[dedupe_key(normalized)] = normalized

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows.values())
    print(f"Collected {len(rows)} unique jobs -> {output}")


if __name__ == "__main__":
    main()

