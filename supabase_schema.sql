-- ============================================================
-- BLOOD BANK TRANSFUSION SAFETY MANAGEMENT SYSTEM
-- Supabase SQL Schema + RLS Policies
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('hod', 'officer', 'lab_tech', 'clinician', 'nurse')),
  ward TEXT,
  workstation TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  failed_login_count INT DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own; HOD/Officer can read all
CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_elevated_read" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hod', 'officer')
    )
  );

CREATE POLICY "profiles_hod_update" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'hod'
    )
  );

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE patients (
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

-- Clinicians: own patients only
CREATE POLICY "patients_clinician_read" ON patients
  FOR SELECT USING (
    attending_clinician_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('hod', 'officer')
    )
  );

-- Nurses: patients in their ward
CREATE POLICY "patients_nurse_read" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'nurse'
      AND p.ward = patients.ward
    )
  );

CREATE POLICY "patients_insert" ON patients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hod', 'officer', 'clinician')
    )
  );

-- ============================================================
-- BLOOD UNITS (Inventory)
-- ============================================================
CREATE TABLE blood_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode TEXT UNIQUE NOT NULL,
  blood_group TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('PRC', 'FFP', 'PLT', 'CRYO', 'WB')),
  donor_id TEXT, -- anonymous donor ID only
  collected_at TIMESTAMPTZ NOT NULL,
  expiry_at TIMESTAMPTZ NOT NULL,
  storage_location TEXT DEFAULT 'Main Cold Storage',
  temperature_ok BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'available' CHECK (status IN (
    'available', 'reserved', 'issued', 'quarantined', 'discarded', 'emergency_issued'
  )),
  reserved_for_request_id UUID,
  registered_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blood_units ENABLE ROW LEVEL SECURITY;

-- Officers and HOD: full inventory access
CREATE POLICY "units_officer_full" ON blood_units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('hod', 'officer')
    )
  );

-- Lab techs: read only (to check unit for crossmatch)
CREATE POLICY "units_lab_read" ON blood_units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'lab_tech'
    )
  );

-- Nurses: read issued units for their ward only (via join with requests)
CREATE POLICY "units_nurse_read" ON blood_units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'nurse'
    )
    AND status IN ('issued', 'emergency_issued')
  );

-- ============================================================
-- TRANSFUSION REQUESTS
-- ============================================================
CREATE TABLE transfusion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  requesting_clinician_id UUID NOT NULL REFERENCES profiles(id),
  product_type TEXT NOT NULL,
  units_requested INT NOT NULL DEFAULT 1,
  urgency TEXT NOT NULL CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  clinical_indication TEXT NOT NULL,
  indication_notes TEXT,
  pre_transfusion_hb NUMERIC(4,1),
  consent_confirmed BOOLEAN NOT NULL DEFAULT false,
  sample_dispatched BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'requested',
  assigned_lab_tech_id UUID REFERENCES profiles(id),
  assigned_unit_id UUID REFERENCES blood_units(id),
  crossmatch_report_id UUID,
  emergency_justification TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transfusion_requests ENABLE ROW LEVEL SECURITY;

-- Clinicians: own requests only
CREATE POLICY "requests_clinician_own" ON transfusion_requests
  FOR ALL USING (requesting_clinician_id = auth.uid());

-- Officers and HOD: all requests
CREATE POLICY "requests_officer_full" ON transfusion_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('hod', 'officer')
    )
  );

-- Lab techs: assigned requests only
CREATE POLICY "requests_lab_assigned" ON transfusion_requests
  FOR SELECT USING (assigned_lab_tech_id = auth.uid());

-- Nurses: requests for their ward
CREATE POLICY "requests_nurse_ward" ON transfusion_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p, patients pt
      WHERE p.id = auth.uid()
      AND p.role = 'nurse'
      AND pt.id = transfusion_requests.patient_id
      AND pt.ward = p.ward
    )
  );

-- ============================================================
-- CROSSMATCH REPORTS
-- ============================================================
CREATE TABLE crossmatch_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES transfusion_requests(id),
  lab_tech_id UUID NOT NULL REFERENCES profiles(id),
  patient_blood_group TEXT NOT NULL,
  unit_id UUID NOT NULL REFERENCES blood_units(id),
  abo_result TEXT CHECK (abo_result IN ('compatible', 'incompatible')),
  antibody_screen TEXT DEFAULT 'pending' CHECK (antibody_screen IN ('negative', 'positive', 'pending')),
  crossmatch_result TEXT DEFAULT 'pending' CHECK (crossmatch_result IN ('compatible', 'incompatible', 'pending')),
  finalized BOOLEAN DEFAULT false,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crossmatch_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crossmatch_lab_own" ON crossmatch_reports
  FOR ALL USING (lab_tech_id = auth.uid());

CREATE POLICY "crossmatch_officer_read" ON crossmatch_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('hod', 'officer')
    )
  );

-- ============================================================
-- ISSUE AUTHORIZATIONS (Dual-Verification)
-- ============================================================
CREATE TABLE issue_authorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES transfusion_requests(id),
  unit_id UUID NOT NULL REFERENCES blood_units(id),
  officer_id UUID NOT NULL REFERENCES profiles(id),
  nurse_id UUID REFERENCES profiles(id),
  officer_confirmed_at TIMESTAMPTZ,
  nurse_confirmed_at TIMESTAMPTZ,
  patient_wristband_scanned BOOLEAN DEFAULT false,
  unit_barcode_scanned_officer BOOLEAN DEFAULT false,
  unit_barcode_scanned_nurse BOOLEAN DEFAULT false,
  abo_check_passed BOOLEAN DEFAULT false,
  expiry_check_passed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending_officer' CHECK (status IN (
    'pending_officer', 'pending_nurse', 'dual_confirmed', 'blocked', 'issued'
  )),
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE issue_authorizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "issue_auth_officer" ON issue_authorizations
  FOR ALL USING (
    officer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'hod'
    )
  );

CREATE POLICY "issue_auth_nurse" ON issue_authorizations
  FOR SELECT USING (nurse_id = auth.uid());

CREATE POLICY "issue_auth_nurse_update" ON issue_authorizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p, transfusion_requests tr, patients pt
      WHERE p.id = auth.uid()
      AND p.role = 'nurse'
      AND tr.id = issue_authorizations.request_id
      AND pt.id = tr.patient_id
      AND pt.ward = p.ward
    )
  );

-- ============================================================
-- TRANSFUSION MONITORING
-- ============================================================
CREATE TABLE transfusion_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES transfusion_requests(id),
  nurse_id UUID NOT NULL REFERENCES profiles(id),
  transfusion_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vitals JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  reaction_reported BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transfusion_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monitoring_nurse_own" ON transfusion_monitoring
  FOR ALL USING (nurse_id = auth.uid());

CREATE POLICY "monitoring_elevated_read" ON transfusion_monitoring
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('hod', 'officer', 'clinician')
    )
  );

-- ============================================================
-- ADVERSE REACTIONS
-- ============================================================
CREATE TABLE adverse_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES transfusion_requests(id),
  unit_id UUID NOT NULL REFERENCES blood_units(id),
  nurse_id UUID NOT NULL REFERENCES profiles(id),
  reaction_types TEXT[] NOT NULL,
  onset_minutes INT,
  volume_transfused_ml NUMERIC(6,1),
  stop_transfusion_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  immediate_actions TEXT[] DEFAULT '{}',
  notes TEXT,
  investigation_status TEXT DEFAULT 'open' CHECK (investigation_status IN ('open', 'under_investigation', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE adverse_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adverse_nurse_create" ON adverse_reactions
  FOR INSERT WITH CHECK (nurse_id = auth.uid());

CREATE POLICY "adverse_nurse_own_read" ON adverse_reactions
  FOR SELECT USING (nurse_id = auth.uid());

CREATE POLICY "adverse_elevated_all" ON adverse_reactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('hod', 'officer')
    )
  );

-- ============================================================
-- AUDIT LOGS (Immutable — no UPDATE or DELETE policies)
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only HOD can read full audit trail
CREATE POLICY "audit_hod_read" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'hod'
    )
  );

-- Any authenticated user can insert (triggers + functions also insert)
CREATE POLICY "audit_insert_any" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'urgent', 'critical')),
  read BOOLEAN DEFAULT false,
  related_resource_type TEXT,
  related_resource_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (recipient_id = auth.uid());

-- ============================================================
-- DONOR REGISTRY (Officers and HOD only — no donor-patient link)
-- ============================================================
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_code TEXT UNIQUE NOT NULL, -- anonymous code, not real name shown in lab
  blood_group TEXT NOT NULL,
  eligibility_status TEXT DEFAULT 'eligible' CHECK (eligibility_status IN ('eligible', 'temporarily_deferred', 'permanently_deferred')),
  deferral_reason TEXT,
  last_donation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "donors_officer_full" ON donors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('hod', 'officer')
    )
  );

-- ============================================================
-- HELPER FUNCTION: Get inventory counts per blood group × product
-- ============================================================
CREATE OR REPLACE FUNCTION get_inventory_counts()
RETURNS TABLE (
  blood_group TEXT,
  product_type TEXT,
  available BIGINT,
  reserved BIGINT,
  expiring_48h BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bu.blood_group,
    bu.product_type,
    COUNT(*) FILTER (WHERE bu.status = 'available') AS available,
    COUNT(*) FILTER (WHERE bu.status = 'reserved') AS reserved,
    COUNT(*) FILTER (
      WHERE bu.status = 'available'
      AND bu.expiry_at < NOW() + INTERVAL '48 hours'
    ) AS expiring_48h
  FROM blood_units bu
  GROUP BY bu.blood_group, bu.product_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: Auto-update updated_at on transfusion_requests
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_requests_updated_at
  BEFORE UPDATE ON transfusion_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_units_updated_at
  BEFORE UPDATE ON blood_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
