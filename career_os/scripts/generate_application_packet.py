#!/usr/bin/env python3
"""Generate a concise application packet for one scored job."""

from __future__ import annotations

import argparse
import csv
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_DEFAULT = ROOT / "data" / "jobs_raw.csv"
RAW_SAMPLE = ROOT / "data" / "jobs_raw.sample.csv"
SCORED_DEFAULT = ROOT / "data" / "jobs_scored.csv"
SCORED_SAMPLE = ROOT / "data" / "jobs_scored.sample.csv"
OUTPUT_DIR = ROOT / "outputs" / "tailored_packets"


TEMPLATES = {
    "Healthcare Data Analyst Resume": {
        "angle": "Frontline behavioral health workflow knowledge plus SQL/Python/Excel/BI reporting skills.",
        "cover": "My background combines behavioral health care coordination with hands-on analytics training in SQL, Python, Excel, Power BI/Tableau, and healthcare-focused portfolio work. I am interested in using reporting and data-cleaning skills to help healthcare teams understand workflow patterns, service gaps, and operational outcomes.",
        "recruiter": "Hello [Name], I applied for [Job Title] and wanted to highlight my mix of behavioral health operations experience and practical analytics skills in SQL, Python, Excel, and BI tools. My healthcare readmission-risk project shows how I approach data cleaning, baseline modeling, and communicating limitations clearly.",
        "follow_up": "Hello [Name], I wanted to follow up on my application for [Job Title]. I am especially interested in the role because it connects healthcare operations, reporting, and data-informed decision support.",
        "story": "Managing a 70-80 client caseload while maintaining structured documentation and follow-up visibility.",
    },
    "Clinical Research Coordinator Resume": {
        "angle": "IRB training, regulated documentation, bilingual participant/client communication, and behavioral health coordination.",
        "cover": "I am a bilingual psychology graduate with behavioral health, regulated documentation, participant-facing communication, and IRB Human Subjects Research training. I am interested in clinical research coordination roles that require accuracy, protocol discipline, and strong communication with participants and clinical teams.",
        "recruiter": "Hello [Name], I applied for [Job Title]. My background includes IRB Human Subjects Research training, psychology coursework, behavioral health documentation, bilingual participant-facing communication, and data tracking experience.",
        "follow_up": "Hello [Name], I wanted to follow up on my application for [Job Title]. The role stood out because it combines protocol-focused documentation, participant communication, and healthcare coordination.",
        "story": "Maintaining accurate confidential documentation and coordinating follow-ups across multidisciplinary stakeholders.",
    },
    "Healthcare Operations / QI Resume": {
        "angle": "Healthcare operations, documentation quality, service coordination, and process/reporting visibility.",
        "cover": "My strongest market position is healthcare operations with analytics capability. I understand behavioral health workflows from direct service coordination and can pair that context with Excel, SQL/Python foundations, and dashboard/reporting concepts.",
        "recruiter": "Hello [Name], I applied for [Job Title]. I bring community behavioral health operations experience, documentation quality, stakeholder coordination, and practical analytics training.",
        "follow_up": "Hello [Name], I am following up on [Job Title]. I am interested in helping healthcare teams improve workflow visibility, reporting, and service coordination.",
        "story": "Coordinating across psychiatrists, therapists, ACT, MAT/SUD programs, outpatient clinics, pharmacies, and community agencies.",
    },
    "Program / Project Coordinator Resume": {
        "angle": "Bilingual program coordination, high-volume follow-up, resources, and stakeholder management.",
        "cover": "I bring bilingual healthcare and behavioral health coordination experience, high-volume follow-up discipline, and strong documentation habits to program coordinator roles. I am strongest where programs need organized service tracking, stakeholder communication, and practical reporting.",
        "recruiter": "Hello [Name], I applied for [Job Title]. My background includes bilingual behavioral health coordination, high-volume caseload tracking, community resources, and stakeholder communication.",
        "follow_up": "Hello [Name], I am following up on [Job Title]. I would welcome the chance to discuss how my program coordination and documentation background fits your team.",
        "story": "Coordinating service delivery for approximately 70-80 clients through referrals, follow-ups, transitions, and resource linkage.",
    },
    "Case Management / Behavioral Health Leadership Resume": {
        "angle": "QMHP-CS behavioral health, LOC familiarity, discharge transitions, and community resource navigation.",
        "cover": "I am a bilingual QMHP-CS behavioral health professional with experience in care coordination, psychiatric discharge transitions, community outreach, and resource navigation. I am interested in roles that improve behavioral health access, service continuity, and program support.",
        "recruiter": "Hello [Name], I applied for [Job Title]. My background includes QMHP-CS behavioral health coordination, bilingual client/family communication, discharge transitions, and community resource navigation.",
        "follow_up": "Hello [Name], I wanted to follow up on [Job Title]. The role stood out because it aligns with my behavioral health program support and care coordination experience.",
        "story": "Supporting clients and families in navigating appointments, benefits, medication access, housing, food, and utility resources.",
    },
    "General Data / Business Analyst Resume": {
        "angle": "Operations-aware analyst with healthcare workflow context and practical SQL/Python/Excel/BI training.",
        "cover": "I am an analytics-capable professional with healthcare operations experience and hands-on training in SQL, Python, Excel, Power BI/Tableau, R, and data storytelling. I am especially interested in analyst roles where domain knowledge and clear communication matter.",
        "recruiter": "Hello [Name], I applied for [Job Title]. My portfolio shows practical SQL/Python/Excel/BI skills, and my healthcare operations background helps me connect analysis to real workflows.",
        "follow_up": "Hello [Name], I am following up on [Job Title]. I would be glad to share how my data projects and operations experience align with the team.",
        "story": "Building analytics portfolio projects while working full time in behavioral health.",
    },
    "IT / Helpdesk Analyst Resume": {
        "angle": "Customer-facing troubleshooting, documentation, bilingual support, and healthcare IT bridge value.",
        "cover": "I bring customer-facing IT helpdesk experience, healthcare operations context, bilingual communication, and strong documentation habits. I am interested in IT support roles that offer better pay or a clear path into healthcare systems, reporting, or operations technology.",
        "recruiter": "Hello [Name], I applied for [Job Title]. I have prior IT helpdesk experience, bilingual support skills, healthcare documentation discipline, and analytics foundations that fit healthcare IT support paths.",
        "follow_up": "Hello [Name], I am following up on [Job Title]. I am interested in the role because it connects technical support, clear documentation, and service-oriented problem solving.",
        "story": "Resolving helpdesk issues while documenting cases and explaining technical issues clearly to non-technical users.",
    },
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with open(path, newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def slug(text: str) -> str:
    keep = []
    for char in text.lower():
        keep.append(char if char.isalnum() else "-")
    return "-".join(part for part in "".join(keep).split("-") if part)[:90]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a Digital Juan application packet.")
    parser.add_argument("--job-id", required=True)
    parser.add_argument("--scored", default=str(SCORED_DEFAULT if SCORED_DEFAULT.exists() else SCORED_SAMPLE))
    parser.add_argument("--raw", default=str(RAW_DEFAULT if RAW_DEFAULT.exists() else RAW_SAMPLE))
    args = parser.parse_args()

    scored_rows = {row["job_id"]: row for row in read_csv(Path(args.scored))}
    raw_rows = {row["job_id"]: row for row in read_csv(Path(args.raw))}
    if args.job_id not in scored_rows:
        raise SystemExit(f"Job ID not found in scored file: {args.job_id}")

    scored = scored_rows[args.job_id]
    raw = raw_rows.get(args.job_id, {})
    resume = scored.get("resume_version") or "Master Resume"
    template = TEMPLATES.get(resume, TEMPLATES["General Data / Business Analyst Resume"])
    title = scored.get("job_title") or raw.get("job_title") or "Unknown Role"
    company = scored.get("company") or raw.get("company") or "Unknown Company"
    url = raw.get("url") or raw.get("source_url") or ""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    packet_path = OUTPUT_DIR / f"{args.job_id}_{slug(company)}_{slug(title)}.md"
    approval = scored.get("human_approval_required", "No")
    status = "Ready for Manual Final Step" if approval == "Yes" else "Ready to Apply"

    content = f"""# Application Packet: {title} at {company}

- Job ID: {args.job_id}
- Generated: {date.today().isoformat()}
- Source URL: {url}
- Score: {scored.get("score")}
- Decision: {scored.get("decision")}
- Label: {scored.get("label")}
- Status: {status}
- Human approval required: {approval}
- Approval reason: {scored.get("approval_reason")}

## Best Resume Version

{resume}

## Tailoring Angle

{template["angle"]}

## Best GitHub Project

{scored.get("github_project")}

## Short Cover Letter Paragraph

{template["cover"]}

## Recruiter Message

{template["recruiter"].replace("[Job Title]", title)}

## Follow-Up Message

{template["follow_up"].replace("[Job Title]", title)}

## Best Interview Story

{template["story"]}

## Notes

- Salary: {scored.get("salary_min")} - {scored.get("salary_max")}
- Location/work setup: {scored.get("location")} / {scored.get("work_setup")}
- Skip reason or risk: {scored.get("skip_reason")}
- Final manual review is still required before submission.
"""
    packet_path.write_text(content, encoding="utf-8")
    print(f"Generated packet -> {packet_path}")


if __name__ == "__main__":
    main()

