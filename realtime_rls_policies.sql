-- =======================================================================
-- EduAkses: Supabase Realtime Setup — Compatible with Next-Auth
-- Jalankan di: Supabase Dashboard > SQL Editor
-- =======================================================================
-- Tabel sudah masuk publication (sudah diverifikasi).
-- Script ini hanya perlu dijalankan SEKALI untuk setup RLS.
-- =======================================================================


-- ═══════════════════════════════════════════════════════════════════════
-- STEP 1: TABEL CHAT — Disable RLS agar anon key bisa listen Realtime
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE direct_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE priority_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════════
-- STEP 2: USER NOTIFICATIONS — Enable RLS + Allow anon SELECT & UPDATE
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anon_select_notifications" ON user_notifications;
CREATE POLICY "allow_anon_select_notifications" ON user_notifications
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "allow_service_insert_notifications" ON user_notifications;
CREATE POLICY "allow_service_insert_notifications" ON user_notifications
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_authenticated_update_notifications" ON user_notifications;
CREATE POLICY "allow_authenticated_update_notifications" ON user_notifications
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =======================================================================
-- SELESAI. Sekarang test: kirim pesan dari 1 tab → harus muncul di tab lain
-- =======================================================================

