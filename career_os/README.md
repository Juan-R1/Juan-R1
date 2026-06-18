# Career OS

Career OS is a practical job-search operating system for Juan Ramirez. It is built to find higher-paying roles, score them with Digital Juan, prepare tailored materials only when the role is worth the effort, and keep private application data out of public files.

## Weekly Use

1. Add jobs to `career_os/data/jobs_raw.csv` from saved searches, job alerts, APIs, or manually copied postings.
2. Run `python3 career_os/scripts/score_jobs.py` to create `career_os/data/jobs_scored.csv`.
3. Review top jobs in `career_os/queues/review_queue.md` or the scored CSV.
4. Generate packets for Apply jobs with `python3 career_os/scripts/generate_application_packet.py --job-id JOB_ID`.
5. Apply manually, or move jobs to `Ready for Manual Final Step` when verification, sensitive fields, or final review is required.
6. Update tracking with `python3 career_os/scripts/update_tracker.py --job-id JOB_ID --status Applied`.
7. Send recruiter messages and follow-ups from the generated packet.
8. Prepare interview answers from `INTERVIEW_STORY_BANK.md`.

## Core Files

- `DIGITAL_JUAN.md`: Candidate profile, safe claims, approval rules, and automation policy.
- `JOB_SCORING_RUBRIC.md`: 100-point scoring system and decision thresholds.
- `CAREER_COUNCIL.md`: Role-by-role review format.
- `JOB_SEARCH_SOURCES.md`: Job-board and employer-source configurations.
- `APPLICATION_TEMPLATES.md`: Reusable tailoring blocks by target role.
- `AUTO_APPLY_GUARDRAILS.md`: What can and cannot be automated.
- `NEXT_LEVEL_ROLE_MAP.md`: Search strategy by role category.
- `WEEKLY_APPLICATION_OS.md`: Weekly operating cadence.

## Scripts

- `scripts/collect_jobs.py`: Normalizes manually exported or pasted job CSVs. It does not scrape sites.
- `scripts/score_jobs.py`: Scores jobs using keyword and rule-based Digital Juan logic.
- `scripts/generate_application_packet.py`: Creates a concise Markdown packet for one scored job.
- `scripts/update_tracker.py`: Updates the application tracker CSV.

## Privacy

Public-safe templates live in `career_os/config/*.template.json`. Private answers, references, application trackers, raw jobs, scored jobs, and tailored packets are ignored by `.gitignore`. Do not commit phone numbers, DOB, references, demographic answers, SSN, driver license, IDs, passwords, or application-specific legal attestations.

## Fast Start

```bash
cp career_os/data/jobs_raw.sample.csv career_os/data/jobs_raw.csv
python3 career_os/scripts/score_jobs.py
python3 career_os/scripts/generate_application_packet.py --job-id SAMPLE-001
python3 career_os/scripts/update_tracker.py --job-id SAMPLE-001 --status "Ready to Apply"
```

