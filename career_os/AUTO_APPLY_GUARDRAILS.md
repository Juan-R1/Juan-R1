# Auto-Apply Guardrails

## Automation Level

The system is partially safe for automation. It can safely prepare applications, select materials, draft messages, and fill a tracker. It should not submit applications that require sensitive information, final attestations, human verification, or uncertain legal commitments.

## Can Be Automated

- Job discovery through approved sources.
- Job deduplication.
- Company quality checks.
- Job scoring.
- Resume selection.
- Keyword tailoring.
- Cover letter paragraph drafting.
- Recruiter message drafting.
- Follow-up drafting.
- Application packet generation.
- Basic form autofill preparation for standard, truthful, non-sensitive answers.
- Tracker updates.
- Queue and notification drafting.

## Must Be Queued For Juan

- SSN, driver license, ID documents, banking, passwords, login credentials.
- AI, automation, bot, CAPTCHA, or human-verification checks.
- Relocation date, cost, lease status, moving timeline, deadline, or firm commitment.
- Early references for strong roles.
- Strong roles with unclear salary.
- Unusual legal terms.
- Any sensitive field not already approved.

## Must Never Be Automated

- Bypassing verification.
- Misrepresenting AI/automation use.
- Submitting false credential claims.
- Applying to suspicious, predatory, MLM, commission-only, or underpaid roles with no strategic value.
- Entering SSN or driver license without Juan.
- Accepting predatory terms.

## Sensitive Question Policy

Pause the specific job, save prepared materials, mark the job `Human Approval Needed`, write a notification, and continue the batch.

## Salary Policy

Default desired salary is $60,000. Text answer: `My target range is $60,000-$70,000+, depending on the role, benefits, work arrangement, growth opportunity, and total compensation package.`

## Relocation Policy

Open only when pay, benefits, career growth, and relocation package make it worthwhile. No relocation below $60,000.

## Work Authorization Policy

Juan is a U.S. citizen, authorized to work in the United States, and does not require visa sponsorship now or in the future. Keep full application answers in ignored private config only.

## EEO, Disability, Veteran Policy

Use private ignored config for actual demographic answers. Do not store demographic answers in public files.

## Background Check Policy

Standard legitimate employment background check and drug-test consent may be prepared from private ignored config. Any unusual scope, fees, third-party privacy concern, or early sensitive request must pause for Juan.

## Application Log Requirements

Every application packet or paused job must record job ID, company, title, source, URL, score, decision, status, resume version, packet path, approval level, and next action.

## Ready For Manual Final Step

Use when all safe prep is complete but Juan must handle final submit, verification, sensitive field, or manual review.

## No-Wait Batch Rule

One paused application must not block the batch. Save, queue, notify, and continue.

