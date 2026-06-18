#!/usr/bin/env python3
"""Score raw job leads with Digital Juan's lightweight rubric."""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_DEFAULT = ROOT / "data" / "jobs_raw.csv"
RAW_SAMPLE = ROOT / "data" / "jobs_raw.sample.csv"
SCORED_DEFAULT = ROOT / "data" / "jobs_scored.csv"


POSITIVE = {
    "healthcare": 10,
    "behavioral health": 10,
    "mental health": 8,
    "population health": 10,
    "quality improvement": 12,
    "quality": 8,
    "clinical research": 10,
    "research coordinator": 8,
    "data analyst": 10,
    "business analyst": 9,
    "operations analyst": 9,
    "program coordinator": 8,
    "care coordination": 10,
    "reporting": 7,
    "dashboard": 7,
    "sql": 6,
    "python": 5,
    "excel": 5,
    "power bi": 5,
    "tableau": 5,
    "bilingual": 4,
    "remote": 6,
    "el paso": 5,
    "texas": 3,
}

NEGATIVE = {
    "rn required": 30,
    "registered nurse": 30,
    "lcsw": 30,
    "lpc": 30,
    "licensed clinician": 25,
    "therapist": 20,
    "medical provider": 25,
    "epic certification required": 25,
    "medical coder certification": 15,
    "senior data scientist": 30,
    "machine learning engineer": 30,
    "software engineer": 25,
    "senior bi architect": 25,
    "commission only": 35,
    "commission-only": 35,
    "mlm": 35,
    "be your own boss": 35,
    "unpaid internship": 30,
    "upfront payment": 40,
    "5+ years": 10,
}

RESUME_RULES = [
    (("clinical research", "research coordinator", "clinical data coordinator", "study coordinator"), "Clinical Research Coordinator Resume", "healthcare-readmission-risk"),
    (("quality", "quality improvement", "utilization", "operations analyst", "healthcare operations"), "Healthcare Operations / QI Resume", "healthcare-readmission-risk"),
    (("program coordinator", "project coordinator", "community programs"), "Program / Project Coordinator Resume", "cost-of-living-forecast-2025"),
    (("behavioral health", "case management", "care coordinator", "care coordination"), "Case Management / Behavioral Health Leadership Resume", "Juan-R1 profile README"),
    (("healthcare data", "data analyst", "population health", "reporting analyst", "data coordinator"), "Healthcare Data Analyst Resume", "healthcare-readmission-risk"),
    (("business analyst", "general data", "reporting"), "General Data / Business Analyst Resume", "divvy-2024-analysis"),
    (("helpdesk", "service desk", "it support", "technical support"), "IT / Helpdesk Analyst Resume", "Juan-R1 profile README"),
]


def clean_int(value: str | None) -> int | None:
    if not value:
        return None
    match = re.search(r"\d+", str(value).replace(",", ""))
    return int(match.group(0)) if match else None


def text_for(row: dict[str, str]) -> str:
    return " ".join(str(v or "") for v in row.values()).lower()


def salary_points(row: dict[str, str]) -> tuple[int, str]:
    salary_min = clean_int(row.get("salary_min"))
    salary_max = clean_int(row.get("salary_max"))
    best = salary_max or salary_min
    if best is None:
        return 10, "Needs research"
    if best >= 70000:
        return 20, ""
    if best >= 60000:
        return 17, ""
    if best >= 50000:
        return 12, ""
    return 2, "Below $50k unless strategic"


def choose_resume_and_project(text: str) -> tuple[str, str]:
    for terms, resume, project in RESUME_RULES:
        if any(term in text for term in terms):
            return resume, project
    return "Master Resume", "Juan-R1 profile README"


def score_row(row: dict[str, str]) -> dict[str, str]:
    text = text_for(row)
    score = 35
    notes: list[str] = []
    human_reasons: list[str] = []

    pay_points, pay_note = salary_points(row)
    score += pay_points
    if pay_note:
        notes.append(pay_note)
        if pay_note == "Needs research":
            human_reasons.append("Salary needs research")

    for phrase, points in POSITIVE.items():
        if phrase in text:
            score += points

    skip_reasons: list[str] = []
    for phrase, points in NEGATIVE.items():
        if phrase in text:
            score -= points
            skip_reasons.append(f"Penalized for {phrase}")

    work_setup = (row.get("work_setup") or row.get("remote_hybrid_onsite") or "").lower()
    location = (row.get("location") or "").lower()
    salary_max = clean_int(row.get("salary_max"))
    if "relocation" in work_setup and (salary_max is None or salary_max < 60000):
        score -= 25
        skip_reasons.append("Relocation below $60k or unclear")
    if "remote" in work_setup:
        score += 8
    elif "hybrid" in work_setup and "el paso" in (work_setup + " " + location):
        score += 7
    elif "el paso" in location:
        score += 5

    sensitive = (row.get("requires_sensitive_legal_answers") or "").strip().lower()
    description = text
    sensitive_terms = ["ssn", "social security", "driver's license", "drivers license", "captcha", "human verification", "ai verification", "references required"]
    if sensitive in {"yes", "true", "1"} or any(term in description for term in sensitive_terms):
        human_reasons.append("Sensitive/legal/manual verification review")

    score = max(0, min(100, score))

    if skip_reasons and score < 65:
        decision = "Skip"
    elif score >= 75:
        decision = "Apply"
    elif score >= 65:
        decision = "Maybe"
    else:
        decision = "Skip"

    if score >= 85:
        label = "Launch Role"
    elif score >= 75:
        label = "Strong Bridge Role"
    elif score >= 65:
        label = "Stretch Worth Trying"
    elif score >= 50:
        label = "Low-Value Role"
    else:
        label = "Skip"

    resume, project = choose_resume_and_project(text)
    return {
        "job_id": row.get("job_id") or "",
        "company": row.get("company") or "",
        "job_title": row.get("job_title") or row.get("title") or "",
        "location": row.get("location") or "",
        "work_setup": row.get("work_setup") or row.get("remote_hybrid_onsite") or "",
        "salary_min": row.get("salary_min") or "",
        "salary_max": row.get("salary_max") or "",
        "score": str(score),
        "decision": decision,
        "label": label,
        "resume_version": resume,
        "github_project": project,
        "human_approval_required": "Yes" if human_reasons else "No",
        "approval_reason": "; ".join(human_reasons),
        "skip_reason": "; ".join(skip_reasons or notes),
    }


def dedupe(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    seen: dict[tuple[str, str, str, str], dict[str, str]] = {}
    for row in rows:
        key = (
            (row.get("company") or "").strip().lower(),
            (row.get("job_title") or row.get("title") or "").strip().lower(),
            (row.get("location") or "").strip().lower(),
            (row.get("url") or "").strip().lower(),
        )
        seen[key] = row
    return list(seen.values())


def main() -> None:
    parser = argparse.ArgumentParser(description="Score Digital Juan job leads.")
    parser.add_argument("--input", default=str(RAW_DEFAULT if RAW_DEFAULT.exists() else RAW_SAMPLE))
    parser.add_argument("--output", default=str(SCORED_DEFAULT))
    args = parser.parse_args()

    with open(args.input, newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    scored = [score_row(row) for row in dedupe(rows)]
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "job_id",
        "company",
        "job_title",
        "location",
        "work_setup",
        "salary_min",
        "salary_max",
        "score",
        "decision",
        "label",
        "resume_version",
        "github_project",
        "human_approval_required",
        "approval_reason",
        "skip_reason",
    ]
    with open(output_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(scored)

    print(f"Scored {len(scored)} jobs -> {output_path}")
    print(f"Apply: {sum(r['decision'] == 'Apply' for r in scored)} | Maybe: {sum(r['decision'] == 'Maybe' for r in scored)} | Skip: {sum(r['decision'] == 'Skip' for r in scored)}")


if __name__ == "__main__":
    main()

