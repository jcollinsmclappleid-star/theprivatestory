-- Generation job progress polling (client /api/generate-job/:id)
ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;
ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS progress_label text;
