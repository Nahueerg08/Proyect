-- Migration: Extend technician_verifications for multi-step identity verification
-- Adds front/back DNI images, selfie, OCR/face matching fields, processing status

BEGIN;

ALTER TABLE public.technician_verifications
  ADD COLUMN IF NOT EXISTS dni_front_url text,
  ADD COLUMN IF NOT EXISTS dni_back_url text,
  ADD COLUMN IF NOT EXISTS selfie_url text,
  ADD COLUMN IF NOT EXISTS ocr_data jsonb,
  ADD COLUMN IF NOT EXISTS face_match_score numeric,
  ADD COLUMN IF NOT EXISTS liveness_score numeric,
  ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending','processing','success','failed')),
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false;

-- Indexes to help admin queries / processing jobs
CREATE INDEX IF NOT EXISTS idx_technician_verifications_processing_status ON public.technician_verifications(processing_status);
CREATE INDEX IF NOT EXISTS idx_technician_verifications_face_score ON public.technician_verifications(face_match_score);

COMMIT;
