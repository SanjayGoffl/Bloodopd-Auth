-- ============================================================
-- DEMO SEED DATA — Blood Bank Transfusion Safety System
-- Run AFTER schema creation. Uses Supabase Auth UUIDs.
-- ============================================================

-- NOTE: In a real Supabase setup, first create auth users via the
-- Supabase dashboard or auth.admin API, then insert profiles with
-- the matching UUIDs. For the hackathon demo we use fixed UUIDs.

-- Demo user passwords are all: Demo@1234

-- Insert into auth.users manually via Supabase Auth dashboard, then:

INSERT INTO profiles (id, email, full_name, role, ward, workstation, department) VALUES
  ('11111111-0000-0000-0000-000000000001', 'hod@hospital.in', 'Dr. Priya Mehta', 'hod', NULL, NULL, 'Pathology'),
  ('11111111-0000-0000-0000-000000000002', 'officer@hospital.in', 'Dr. Ramesh Nair', 'officer', NULL, NULL, 'Blood Bank'),
  ('11111111-0000-0000-0000-000000000003', 'labtech@hospital.in', 'Anjali Sharma', 'lab_tech', NULL, 'WS-01', 'Blood Bank'),
  ('11111111-0000-0000-0000-000000000004', 'clinician@hospital.in', 'Dr. Suresh Pillai', 'clinician', 'Cardiac ICU', NULL, 'Cardiology'),
  ('11111111-0000-0000-0000-000000000005', 'nurse@hospital.in', 'Meena Thomas', 'nurse', 'Cardiac ICU', NULL, 'Nursing');

-- Patients
INSERT INTO patients (id, uhid, full_name, dob, blood_group, ward, bed_number, attending_clinician_id) VALUES
  ('22222222-0000-0000-0000-000000000001', 'UHID-2024-0001', 'Rajan Krishnamurthy', '1960-05-14', 'A+', 'Cardiac ICU', 'C-12', '11111111-0000-0000-0000-000000000004'),
  ('22222222-0000-0000-0000-000000000002', 'UHID-2024-0002', 'Fatima Begum', '1975-11-22', 'B+', 'Cardiac ICU', 'C-14', '11111111-0000-0000-0000-000000000004'),
  ('22222222-0000-0000-0000-000000000003', 'UHID-2024-0003', 'Vikram Singh', '1985-03-08', 'O-', 'Cardiac ICU', 'C-07', '11111111-0000-0000-0000-000000000004');

-- Blood Units
INSERT INTO blood_units (id, barcode, blood_group, product_type, donor_id, collected_at, expiry_at, status) VALUES
  ('33333333-0000-0000-0000-000000000001', 'BB-PRC-A+-001', 'A+', 'PRC', 'DON-2024-0881', NOW() - INTERVAL '10 days', NOW() + INTERVAL '25 days', 'available'),
  ('33333333-0000-0000-0000-000000000002', 'BB-PRC-A+-002', 'A+', 'PRC', 'DON-2024-0892', NOW() - INTERVAL '5 days', NOW() + INTERVAL '30 days', 'available'),
  ('33333333-0000-0000-0000-000000000003', 'BB-PRC-B+-001', 'B+', 'PRC', 'DON-2024-0901', NOW() - INTERVAL '3 days', NOW() + INTERVAL '32 days', 'available'),
  ('33333333-0000-0000-0000-000000000004', 'BB-PRC-O--001', 'O-', 'PRC', 'DON-2024-0755', NOW() - INTERVAL '30 days', NOW() + INTERVAL '5 days', 'available'),
  ('33333333-0000-0000-0000-000000000005', 'BB-FFP-AB+-001', 'AB+', 'FFP', 'DON-2024-0802', NOW() - INTERVAL '1 day', NOW() + INTERVAL '364 days', 'available'),
  ('33333333-0000-0000-0000-000000000006', 'BB-PLT-A+-001', 'A+', 'PLT', 'DON-2024-0918', NOW() - INTERVAL '1 day', NOW() + INTERVAL '4 days', 'available'),
  ('33333333-0000-0000-0000-000000000007', 'BB-PRC-A+-003', 'A+', 'PRC', 'DON-2024-0923', NOW() - INTERVAL '2 days', NOW() + INTERVAL '33 days', 'reserved'),
  ('33333333-0000-0000-0000-000000000008', 'BB-FFP-B+-001', 'B+', 'FFP', 'DON-2024-0944', NOW() - INTERVAL '4 days', NOW() + INTERVAL '361 days', 'available'),
  ('33333333-0000-0000-0000-000000000009', 'BB-PRC-O+-001', 'O+', 'PRC', 'DON-2024-0956', NOW() - INTERVAL '6 days', NOW() + INTERVAL '29 days', 'available'),
  ('33333333-0000-0000-0000-000000000010', 'BB-PLT-O+-001', 'O+', 'PLT', 'DON-2024-0967', NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days', 'available');

-- Transfusion Requests
INSERT INTO transfusion_requests (id, patient_id, requesting_clinician_id, product_type, units_requested, urgency, clinical_indication, pre_transfusion_hb, consent_confirmed, sample_dispatched, status, assigned_lab_tech_id, assigned_unit_id) VALUES
  ('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 'PRC', 2, 'urgent', 'Post-operative blood loss — CABG', 7.8, true, true, 'crossmatched', '11111111-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000007'),
  ('44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000004', 'PRC', 1, 'routine', 'Haematological condition — anaemia', 6.2, true, true, 'grouping_complete', '11111111-0000-0000-0000-000000000003', NULL),
  ('44444444-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004', 'PRC', 2, 'emergency', 'Trauma — MVA with haemoperitoneum', 5.1, true, true, 'dual_verified', '11111111-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000004');

-- Crossmatch Reports
INSERT INTO crossmatch_reports (id, request_id, lab_tech_id, patient_blood_group, unit_id, abo_result, antibody_screen, crossmatch_result, finalized, finalized_at) VALUES
  ('55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 'A+', '33333333-0000-0000-0000-000000000007', 'compatible', 'negative', 'compatible', true, NOW() - INTERVAL '2 hours');

-- Notifications
INSERT INTO notifications (recipient_id, title, body, severity, related_resource_type, related_resource_id) VALUES
  ('11111111-0000-0000-0000-000000000002', 'Emergency Request — Cardiac ICU', 'Dr. Suresh Pillai raised an EMERGENCY transfusion request for patient UHID-2024-0003', 'critical', 'transfusion_request', '44444444-0000-0000-0000-000000000003'),
  ('11111111-0000-0000-0000-000000000005', 'Unit Ready for Collection', 'Blood unit BB-PRC-A+-003 is crossmatched and ready. Collection deadline: 4 hours.', 'urgent', 'blood_unit', '33333333-0000-0000-0000-000000000007'),
  ('11111111-0000-0000-0000-000000000003', 'New Sample Assigned — WS-01', 'Patient UHID-2024-0002 sample assigned to your workstation for grouping and crossmatch.', 'info', 'transfusion_request', '44444444-0000-0000-0000-000000000002');

-- Donors (anonymous)
INSERT INTO donors (donor_code, blood_group, eligibility_status, last_donation_at) VALUES
  ('DON-2024-0881', 'A+', 'eligible', NOW() - INTERVAL '10 days'),
  ('DON-2024-0892', 'A+', 'eligible', NOW() - INTERVAL '5 days'),
  ('DON-2024-0901', 'B+', 'eligible', NOW() - INTERVAL '3 days'),
  ('DON-2024-0755', 'O-', 'temporarily_deferred', NOW() - INTERVAL '30 days'),
  ('DON-2024-0802', 'AB+', 'eligible', NOW() - INTERVAL '1 day');
