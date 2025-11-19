-- MedCharting Database Schema for Supabase

-- Patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER,
  gender VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chart entries table
CREATE TABLE chart_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  primary_complaint TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'signed')),
  owner VARCHAR(255) NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Body chart drawings table
CREATE TABLE body_chart_drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chart_entry_id UUID REFERENCES chart_entries(id) ON DELETE CASCADE,
  drawing_data TEXT NOT NULL, -- Base64 encoded image data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table
CREATE TABLE file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chart_entry_id UUID REFERENCES chart_entries(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_chart_entries_patient_id ON chart_entries(patient_id);
CREATE INDEX idx_body_chart_drawings_chart_entry_id ON body_chart_drawings(chart_entry_id);
CREATE INDEX idx_file_uploads_chart_entry_id ON file_uploads(chart_entry_id);
CREATE INDEX idx_patients_name ON patients(name);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_chart_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- For now, allow all authenticated users to access all data
CREATE POLICY "Allow all access to patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all access to chart_entries" ON chart_entries FOR ALL USING (true);
CREATE POLICY "Allow all access to body_chart_drawings" ON body_chart_drawings FOR ALL USING (true);
CREATE POLICY "Allow all access to file_uploads" ON file_uploads FOR ALL USING (true);

-- Create storage bucket for file uploads
-- Run this in the Supabase dashboard or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chart-files', 'chart-files', false);
