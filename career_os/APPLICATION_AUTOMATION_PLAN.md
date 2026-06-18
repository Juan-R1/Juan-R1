# Application Automation Plan

## Architecture

```text
career_os/
  config/
    candidate_profile.json
    search_sources.json
    default_answers.template.json
    default_application_answers.template.json
    reference_contacts.template.json
  data/
    jobs_raw.csv
    jobs_scored.csv
    applications_tracker.csv
    recruiter_outreach.csv
  queues/
    review_queue.md
    ready_to_apply.md
    human_approval_needed.md
    notifications_for_juan.md
  outputs/tailored_packets/
  scripts/
    collect_jobs.py
    score_jobs.py
    generate_application_packet.py
    update_tracker.py
```

## Job Collection

Use saved searches, job alerts, official company portals, APIs, RSS, manual review, and exported/copy-pasted CSVs. Do not scrape sites in a way that violates terms. `collect_jobs.py` normalizes approved CSV inputs into `jobs_raw.csv`.

## Deduplication

Deduplicate by normalized company + job title + location + URL. If URL is missing, use company + title + location + source. Keep the newest record and preserve source notes.

## Scoring

`score_jobs.py` applies the 100-point rubric from `JOB_SCORING_RUBRIC.md`, then flags jobs as Apply, Maybe, or Skip. It also flags human approval needs for sensitive fields, relocation complexity, references, legal terms, verification barriers, and unclear salary on strong roles.

## Tailoring

Tailoring happens only after scoring. Jobs below 75 get a short reason unless Juan manually overrides. Apply jobs get resume selection, keywords, tailoring angle, short cover paragraph, recruiter message, follow-up, and interview story.

## Human Approval Queue

Jobs requiring SSN, driver license, verification/CAPTCHA, unusual legal terms, relocation specifics, early references, or sensitive/private fields move to `queues/human_approval_needed.md` and trigger a notification.

## Application Tracking

`update_tracker.py` updates `applications_tracker.csv` with status, dates, score, source, resume version, follow-up date, and notes. Default statuses are Found, Scored, Review Queue, Ready to Apply, Ready for Manual Final Step, Human Approval Needed, Applied, Follow-Up Needed, Interview, Rejected, Offer, Withdrawn, and Skip.

## Resume Selection

- Healthcare Data Analyst Resume: healthcare data, reporting, population health, data coordinator.
- Clinical Research Coordinator Resume: clinical research, study coordinator, clinical data coordinator.
- Program / Project Coordinator Resume: program coordination, project coordination, community programs.
- Healthcare Operations / QI Resume: quality improvement, operations, utilization support, population health.
- Case Management / Behavioral Health Leadership Resume: case management lead, behavioral health specialist.
- General Data / Business Analyst Resume: general analyst, business analyst, reporting analyst.
- IT / Helpdesk Analyst Resume: IT support, helpdesk, healthcare IT bridge.
- Master Resume: fallback or human review.

## Cover Letters, Recruiter Messages, Follow-Ups

Generate short reusable blocks, not full essays, unless score is 75+. Full cover letters are only worth generating for strong Apply jobs or when the application requires one.

## What Should Never Be Automated

- Bypassing CAPTCHA, AI/bot checks, or human verification.
- Entering SSN, driver license, ID, banking, passwords, or credentials.
- Accepting unusual legal terms without Juan.
- Submitting false claims or required credentials Juan does not have.
- Applying to suspicious, predatory, MLM, commission-only, or low-quality jobs.

## What Should Be Prepared Automatically

- Job normalization, deduplication, scoring, summary, resume selection.
- Keyword tailoring, cover paragraph, recruiter message, follow-up, and interview story.
- Application tracker updates and queue entries.
- Safe draft answers for standard, truthful, non-sensitive fields.

## What Should Be Queued For Juan

- Verification/human-final-step applications.
- Sensitive information.
- Relocation commitments.
- Early references for strong roles.
- Strong role with unclear salary.
- Any legal or privacy concern.

## No-Wait Batch Rule

If one job pauses for Juan, save the packet, draft answers, pause reason, queue entry, and notification. Continue to the next job.

