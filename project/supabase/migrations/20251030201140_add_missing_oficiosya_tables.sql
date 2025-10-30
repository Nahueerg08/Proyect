/*
  # Add Missing Tables for OficiosYa
  
  ## New Tables
  
  ### 1. notifications
  - User notifications for reviews, system messages, and promotions
  
  ### 2. contact_logs
  - Track contacts made between clients and technicians
  
  ## Updates
  
  ### technician_profiles
  - Add latitude and longitude columns for geolocation
  - Add availability field
  
  ## Security
  - Enable RLS on all new tables
  - Create appropriate policies
*/

-- Add geolocation columns to technician_profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'technician_profiles' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE technician_profiles ADD COLUMN latitude decimal(10, 8);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'technician_profiles' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE technician_profiles ADD COLUMN longitude decimal(11, 8);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'technician_profiles' AND column_name = 'availability'
  ) THEN
    ALTER TABLE technician_profiles ADD COLUMN availability text DEFAULT 'Disponible';
  END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  type text NOT NULL CHECK (type IN ('review', 'system', 'promotion')),
  created_at timestamptz DEFAULT now()
);

-- Create contact_logs table
CREATE TABLE IF NOT EXISTS contact_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  technician_id uuid NOT NULL REFERENCES technician_profiles(id) ON DELETE CASCADE,
  contact_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_technician_location ON technician_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_contact_logs_technician ON contact_logs(technician_id);

-- Function to create notification when review is added
CREATE OR REPLACE FUNCTION create_review_notification()
RETURNS TRIGGER AS $$
DECLARE
  reviewer_name text;
BEGIN
  SELECT full_name INTO reviewer_name
  FROM profiles
  WHERE id = NEW.client_id;
  
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.technician_id,
    'Nueva reseña recibida',
    reviewer_name || ' te ha dejado una reseña de ' || NEW.rating || ' estrellas',
    'review'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review notifications
DROP TRIGGER IF EXISTS trigger_create_review_notification ON reviews;
CREATE TRIGGER trigger_create_review_notification
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION create_review_notification();

-- Function to update technician rating
CREATE OR REPLACE FUNCTION update_technician_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE technician_profiles
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE technician_id = COALESCE(NEW.technician_id, OLD.technician_id)
        AND is_approved = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE technician_id = COALESCE(NEW.technician_id, OLD.technician_id)
        AND is_approved = true
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.technician_id, OLD.technician_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_technician_rating ON reviews;
CREATE TRIGGER trigger_update_technician_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_technician_rating();

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Contact logs policies
CREATE POLICY "Admins can view all contact logs"
  ON contact_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create contact logs"
  ON contact_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id OR client_id IS NULL);