-- ============================================================
-- COMPLETE SETUP SQL
-- Run this ENTIRE file in the Supabase SQL Editor (once).
-- It creates auth users, schema, and seed data in one shot.
-- ============================================================

-- 1. Create auth users with fixed UUIDs and hashed passwords
--    Password for all: Demo@1234
--    (Supabase SQL editor runs as service role — can write auth.users)

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'hod@hospital.in',
    crypt('Demo@1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Priya Mehta"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'officer@hospital.in',
    crypt('Demo@1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Ramesh Nair"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'labtech@hospital.in',
    crypt('Demo@1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Anjali Sharma"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '11111111-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'clinician@hospital.in',
    crypt('Demo@1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Suresh Pillai"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '11111111-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'nurse@hospital.in',
    crypt('Demo@1234', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Meena Thomas"}',
    false, 'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Also insert into auth.identities (required for email provider)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  ('11111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'hod@hospital.in',     '{"sub":"11111111-0000-0000-0000-000000000001","email":"hod@hospital.in"}',        'email', NOW(), NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'officer@hospital.in',  '{"sub":"11111111-0000-0000-0000-000000000002","email":"officer@hospital.in"}',   'email', NOW(), NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', 'labtech@hospital.in',  '{"sub":"11111111-0000-0000-0000-000000000003","email":"labtech@hospital.in"}',  'email', NOW(), NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004', 'clinician@hospital.in','{"sub":"11111111-0000-0000-0000-000000000004","email":"clinician@hospital.in"}','email', NOW(), NOW(), NOW()),
  ('11111111-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000005', 'nurse@hospital.in',    '{"sub":"11111111-0000-0000-0000-000000000005","email":"nurse@hospital.in"}',    'email', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- ============================================================
-- 2. SCHEMA
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('hod', 'officer', 'lab_tech', 'clinician', 'nurse')),
  ward TEXT,
  workstation TEXT,
  department TEXT,
  employee_id TEXT,
  is_active BOOLEAN DEFAULT true,
  failed_login_count INT DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_read" ON profiles;
DROP POLICY IF EXISTS "profiles_elevated_read" ON profiles;
CREATE POLICY "profiles_self_read" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_elevated_read" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('hod','officer'))
);
CREATE POLICY "profiles_hod_update" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'hod')
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uhid TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  blood_group TEXT NOT NULL,
  ward TEXT NOT NULL,
  bed_number TEXT NOT NULL,
  attending_clinician_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "patients_read" ON patients;
CREATE POLICY "patients_read" ON patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid())
);

-- Blood units
CREATE TABLE IF NOT EXISTS blood_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode TEXT UNIQUE NOT NULL,
  blood_group TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('PRC','FFP','PLT','CRYO','WB')),
  donor_id TEXT,
  collected_at TIMESTAMPTZ NOT NULL,
  expiry_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','issued','discarded','quarantined')),
  storage_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blood_units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blood_units_read" ON blood_units;
CREATE POLICY "blood_units_read" ON blood_units FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('hod','officer','lab_tech'))
);

-- Transfusion requests
CREATE TABLE IF NOT EXISTS transfusion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  requesting_clinician_id UUID REFERENCES profiles(id),
  product_type TEXT NOT NULL,
  units_requested INT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('routine','urgent','emergency')),
  clinical_indication TEXT,
  pre_transfusion_hb NUMERIC(4,1),
  consent_confirmed BOOLEAN DEFAULT false,
  sample_dispatched BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_lab_tech_id UUID REFERENCES profiles(id),
  assigned_unit_id UUID REFERENCES blood_units(id),
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transfusion_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "requests_read" ON transfusion_requests;
CREATE POLICY "requests_read" ON transfusion_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid())
);
CREATE POLICY "requests_insert" ON transfusion_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('clinician','officer'))
);
CREATE POLICY "requests_update" ON transfusion_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('officer','lab_tech','hod'))
);

-- Crossmatch reports
CREATE TABLE IF NOT EXISTS crossmatch_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES transfusion_requests(id),
  lab_tech_id UUID REFERENCES profiles(id),
  patient_blood_group TEXT,
  unit_id UUID REFERENCES blood_units(id),
  abo_result TEXT,
  antibody_screen TEXT,
  crossmatch_result TEXT,
  finalized BOOLEAN DEFAULT false,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crossmatch_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crossmatch_read" ON crossmatch_reports;
CREATE POLICY "crossmatch_read" ON crossmatch_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('hod','officer','lab_tech'))
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info','urgent','critical')),
  read BOOLEAN DEFAULT false,
  related_resource_type TEXT,
  related_resource_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_read" ON notifications;
CREATE POLICY "notifications_read" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (recipient_id = auth.uid());

-- Donors
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_code TEXT UNIQUE NOT NULL,
  blood_group TEXT NOT NULL,
  eligibility_status TEXT DEFAULT 'eligible',
  last_donation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "donors_read" ON donors;
CREATE POLICY "donors_read" ON donors FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('hod','officer'))
);

-- Adverse reactions
CREATE TABLE IF NOT EXISTS adverse_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfusion_request_id UUID REFERENCES transfusion_requests(id),
  reported_by UUID REFERENCES profiles(id),
  reaction_types TEXT[],
  severity TEXT,
  stopped_at TIMESTAMPTZ,
  clinical_notes TEXT,
  notified_roles TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE adverse_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "adverse_read" ON adverse_reactions;
CREATE POLICY "adverse_read" ON adverse_reactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('hod','officer','nurse'))
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_read" ON audit_log;
CREATE POLICY "audit_read" ON audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'hod')
);

-- ============================================================
-- 3. SEED DATA
-- ============================================================

-- Profiles
INSERT INTO profiles (id, email, full_name, role, ward, workstation, department, employee_id) VALUES
  ('11111111-0000-0000-0000-000000000001', 'hod@hospital.in',       'Dr. Priya Mehta',   'hod',       NULL,         NULL,   'Pathology',          'EMP-001'),
  ('11111111-0000-0000-0000-000000000002', 'officer@hospital.in',   'Dr. Ramesh Nair',   'officer',   NULL,         NULL,   'Blood Bank',         'EMP-002'),
  ('11111111-0000-0000-0000-000000000003', 'labtech@hospital.in',   'Anjali Sharma',     'lab_tech',  NULL,         'WS-01','Blood Bank Lab',     'EMP-003'),
  ('11111111-0000-0000-0000-000000000004', 'clinician@hospital.in', 'Dr. Suresh Pillai', 'clinician', 'Cardiac ICU',NULL,   'Cardiology',         'EMP-004'),
  ('11111111-0000-0000-0000-000000000005', 'nurse@hospital.in',     'Meena Thomas',      'nurse',     'Cardiac ICU',NULL,   'Nursing',            'EMP-005')
ON CONFLICT (id) DO NOTHING;

-- Patients
INSERT INTO patients (id, uhid, full_name, dob, blood_group, ward, bed_number, attending_clinician_id) VALUES
  ('22222222-0000-0000-0000-000000000001', 'UHID-2024-0001', 'Rajan Krishnamurthy', '1960-05-14', 'A+', 'Cardiac ICU', 'C-12', '11111111-0000-0000-0000-000000000004'),
  ('22222222-0000-0000-0000-000000000002', 'UHID-2024-0002', 'Fatima Begum',        '1975-11-22', 'B+', 'Cardiac ICU', 'C-14', '11111111-0000-0000-0000-000000000004'),
  ('22222222-0000-0000-0000-000000000003', 'UHID-2024-0003', 'Vikram Singh',        '1985-03-08', 'O-', 'Cardiac ICU', 'C-07', '11111111-0000-0000-0000-000000000004')
ON CONFLICT (uhid) DO NOTHING;

-- Blood units
INSERT INTO blood_units (id, barcode, blood_group, product_type, donor_id, collected_at, expiry_at, status) VALUES
  ('33333333-0000-0000-0000-000000000001', 'BB-PRC-A+-001', 'A+',  'PRC', 'DON-2024-0881', NOW() - INTERVAL '10 days', NOW() + INTERVAL '25 days', 'available'),
  ('33333333-0000-0000-0000-000000000002', 'BB-PRC-A+-002', 'A+',  'PRC', 'DON-2024-0892', NOW() - INTERVAL '5 days',  NOW() + INTERVAL '30 days', 'available'),
  ('33333333-0000-0000-0000-000000000003', 'BB-PRC-B+-001', 'B+',  'PRC', 'DON-2024-0901', NOW() - INTERVAL '3 days',  NOW() + INTERVAL '32 days', 'available'),
  ('33333333-0000-0000-0000-000000000004', 'BB-PRC-O--001', 'O-',  'PRC', 'DON-2024-0755', NOW() - INTERVAL '30 days', NOW() + INTERVAL '5 days',  'available'),
  ('33333333-0000-0000-0000-000000000005', 'BB-FFP-AB+-001','AB+', 'FFP', 'DON-2024-0802', NOW() - INTERVAL '1 day',   NOW() + INTERVAL '364 days','available'),
  ('33333333-0000-0000-0000-000000000006', 'BB-PLT-A+-001', 'A+',  'PLT', 'DON-2024-0918', NOW() - INTERVAL '1 day',   NOW() + INTERVAL '4 days',  'available'),
  ('33333333-0000-0000-0000-000000000007', 'BB-PRC-A+-003', 'A+',  'PRC', 'DON-2024-0923', NOW() - INTERVAL '2 days',  NOW() + INTERVAL '33 days', 'reserved'),
  ('33333333-0000-0000-0000-000000000008', 'BB-FFP-B+-001', 'B+',  'FFP', 'DON-2024-0944', NOW() - INTERVAL '4 days',  NOW() + INTERVAL '361 days','available'),
  ('33333333-0000-0000-0000-000000000009', 'BB-PRC-O+-001', 'O+',  'PRC', 'DON-2024-0956', NOW() - INTERVAL '6 days',  NOW() + INTERVAL '29 days', 'available'),
  ('33333333-0000-0000-0000-000000000010', 'BB-PLT-O+-001', 'O+',  'PLT', 'DON-2024-0967', NOW() - INTERVAL '2 days',  NOW() + INTERVAL '3 days',  'available')
ON CONFLICT (barcode) DO NOTHING;

-- Transfusion requests
INSERT INTO transfusion_requests (id, patient_id, requesting_clinician_id, product_type, units_requested, urgency, clinical_indication, pre_transfusion_hb, consent_confirmed, sample_dispatched, status, assigned_lab_tech_id, assigned_unit_id) VALUES
  ('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 'PRC', 2, 'urgent',    'Post-operative blood loss — CABG',          7.8, true, true, 'crossmatched',    '11111111-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000007'),
  ('44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000004', 'PRC', 1, 'routine',   'Haematological condition — anaemia',        6.2, true, true, 'grouping_complete','11111111-0000-0000-0000-000000000003', NULL),
  ('44444444-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004', 'PRC', 2, 'emergency', 'Trauma — MVA with haemoperitoneum',         5.1, true, true, 'dual_verified',   '11111111-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- Crossmatch report
INSERT INTO crossmatch_reports (id, request_id, lab_tech_id, patient_blood_group, unit_id, abo_result, antibody_screen, crossmatch_result, finalized, finalized_at) VALUES
  ('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 'A+', '33333333-0000-0000-0000-000000000007', 'compatible', 'negative', 'compatible', true, NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (recipient_id, title, body, severity, related_resource_type, related_resource_id) VALUES
  ('11111111-0000-0000-0000-000000000002', 'Emergency Request — Cardiac ICU',  'Dr. Suresh Pillai raised an EMERGENCY transfusion request for UHID-2024-0003', 'critical', 'transfusion_request', '44444444-0000-0000-0000-000000000003'),
  ('11111111-0000-0000-0000-000000000005', 'Unit Ready for Collection',         'BB-PRC-A+-003 is crossmatched and ready. Collect within 4 hours.',              'urgent',   'blood_unit',          '33333333-0000-0000-0000-000000000007'),
  ('11111111-0000-0000-0000-000000000003', 'New Sample Assigned — WS-01',       'UHID-2024-0002 sample assigned for grouping and crossmatch.',                   'info',     'transfusion_request', '44444444-0000-0000-0000-000000000002');

-- Donors
INSERT INTO donors (donor_code, blood_group, eligibility_status, last_donation_at) VALUES
  ('DON-2024-0881', 'A+',  'eligible',            NOW() - INTERVAL '10 days'),
  ('DON-2024-0892', 'A+',  'eligible',            NOW() - INTERVAL '5 days'),
  ('DON-2024-0901', 'B+',  'eligible',            NOW() - INTERVAL '3 days'),
  ('DON-2024-0755', 'O-',  'temporarily_deferred',NOW() - INTERVAL '30 days'),
  ('DON-2024-0802', 'AB+', 'eligible',            NOW() - INTERVAL '1 day')
ON CONFLICT (donor_code) DO NOTHING;
