# Moderation Audit Archive

This folder holds export archives of the platform's moderation queues before clearing events.

## Purpose

Every time the moderation queue is cleared, all records are exported here as a timestamped JSON file **before** deletion. This forms the audit trail required for:
- Platform safety accountability
- CSAM/IWF compliance documentation
- Security testing event records
- Regulatory audit readiness

## Security note

**Do not commit JSON archive files to version control** (enforced by `.gitignore`). In production, these files must be stored in a secure, access-controlled off-repository location (e.g. encrypted S3 bucket with audit logging).

## Archive format

Each archive file is named `<type>-archive-<YYYY-MM-DD>.json` and contains:

```json
{
  "exported_at": "ISO 8601 timestamp",
  "exported_by": "admin user or system",
  "purpose": "human-readable description",
  "summary": {
    "content_blocks_count": 0,
    "csam_reports_count": 0,
    "user_reports_count": 0,
    "date_range": "...",
    "source": "...",
    "note": "..."
  },
  "content_blocks": [...],
  "csam_reports": [...],
  "user_reports": [...]
}
```

## Files in this archive

| File | Description |
|------|-------------|
| `security-stress-test-archive-2026-03-27.json` | 58 content block events + 7 user reports from the initial security and stress testing session on 2026-03-27. All from localhost (::1). No real subscriber data. |
