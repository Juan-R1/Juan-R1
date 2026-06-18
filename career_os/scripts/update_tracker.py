#!/usr/bin/env python3
"""Update the Career OS application tracker CSV."""

from __future__ import annotations

import argparse
import csv
from datetime import date, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TRACKER_DEFAULT = ROOT / "data" / "applications_tracker.csv"
SCORED_DEFAULT = ROOT / "data" / "jobs_scored.csv"
SCORED_SAMPLE = ROOT / "data" / "jobs_scored.sample.csv"

FIELDNAMES = [
    "job_id",
    "date_added",
    "company",
    "job_title",
    "salary_min",
    "salary_max",
    "location",
    "work_setup",
    "source_url",
    "status",
    "priority",
    "fit_score",
    "best_resume_version",
    "tailored_resume",
    "cover_letter",
    "follow_up_date",
    "interview_date",
    "recruiter_hm",
    "notes",
    "next_action",
]


def read_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def priority(score: int) -> str:
    if score >= 85:
        return "High"
    if score >= 75:
        return "Medium"
    return "Low"


def main() -> None:
    parser = argparse.ArgumentParser(description="Update application tracker.")
    parser.add_argument("--job-id", required=True)
    parser.add_argument("--status", required=True)
    parser.add_argument("--notes", default="")
    parser.add_argument("--next-action", default="")
    parser.add_argument("--tracker", default=str(TRACKER_DEFAULT))
    parser.add_argument("--scored", default=str(SCORED_DEFAULT if SCORED_DEFAULT.exists() else SCORED_SAMPLE))
    args = parser.parse_args()

    scored_rows = {row["job_id"]: row for row in read_rows(Path(args.scored))}
    if args.job_id not in scored_rows:
        raise SystemExit(f"Job ID not found in scored file: {args.job_id}")
    scored = scored_rows[args.job_id]
    score = int(scored.get("score") or 0)
    today = date.today().isoformat()
    follow_up = (date.today() + timedelta(days=7)).isoformat() if args.status == "Applied" else ""

    tracker_path = Path(args.tracker)
    rows = read_rows(tracker_path)
    by_id = {row["job_id"]: row for row in rows if row.get("job_id")}
    existing = by_id.get(args.job_id, {})
    updated = {
        **{field: existing.get(field, "") for field in FIELDNAMES},
        "job_id": args.job_id,
        "date_added": existing.get("date_added") or today,
        "company": scored.get("company", ""),
        "job_title": scored.get("job_title", ""),
        "salary_min": scored.get("salary_min", ""),
        "salary_max": scored.get("salary_max", ""),
        "location": scored.get("location", ""),
        "work_setup": scored.get("work_setup", ""),
        "status": args.status,
        "priority": priority(score),
        "fit_score": str(score),
        "best_resume_version": scored.get("resume_version", ""),
        "tailored_resume": "Yes" if args.status in {"Ready to Apply", "Ready for Manual Final Step", "Applied"} else existing.get("tailored_resume", ""),
        "cover_letter": "Paragraph" if args.status in {"Ready to Apply", "Ready for Manual Final Step", "Applied"} else existing.get("cover_letter", ""),
        "follow_up_date": follow_up or existing.get("follow_up_date", ""),
        "notes": args.notes or existing.get("notes", ""),
        "next_action": args.next_action or existing.get("next_action", ""),
    }
    by_id[args.job_id] = updated
    output_rows = list(by_id.values())
    tracker_path.parent.mkdir(parents=True, exist_ok=True)
    with open(tracker_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(output_rows)
    print(f"Updated tracker -> {tracker_path}")


if __name__ == "__main__":
    main()

