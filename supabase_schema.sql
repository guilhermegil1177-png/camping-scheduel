-- ============================================================
-- CAMPAMENTO GECKO - Supabase Schema
-- Executar no SQL Editor do Supabase Dashboard
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'monitor' CHECK (role IN ('director', 'monitor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SCHEDULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TIME_SLOTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  notes JSONB DEFAULT '[]',
  assignees JSONB DEFAULT '[]',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('outdoor', 'indoor', 'craft', 'sport')),
  instructions TEXT DEFAULT '',
  video_url TEXT,
  image_url TEXT,
  materials JSONB DEFAULT '[]',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_schedules_date ON public.schedules(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_schedule ON public.time_slots(schedule_id);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities(category);
CREATE INDEX IF NOT EXISTS idx_messages_schedule ON public.messages(schedule_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER time_slots_updated_at BEFORE UPDATE ON public.time_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users: authenticated can read all, update own
CREATE POLICY "users_select" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Schedules: all authenticated can read, directors can insert/update/delete
CREATE POLICY "schedules_select" ON public.schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedules_insert" ON public.schedules FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('director', 'admin')));
CREATE POLICY "schedules_update" ON public.schedules FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('director', 'admin')));
CREATE POLICY "schedules_delete" ON public.schedules FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('director', 'admin')));

-- Time slots: read all, directors can write
CREATE POLICY "slots_select" ON public.time_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "slots_insert" ON public.time_slots FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('director', 'admin')));
CREATE POLICY "slots_update" ON public.time_slots FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('director', 'admin', 'monitor')));
CREATE POLICY "slots_delete" ON public.time_slots FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('director', 'admin')));

-- Activities: read all, directors can write
CREATE POLICY "activities_select" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "activities_insert" ON public.activities FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('director', 'admin')));
CREATE POLICY "activities_delete" ON public.activities FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('director', 'admin')));

-- Messages: read all, write own
CREATE POLICY "messages_select" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Notifications: read/update own
CREATE POLICY "notif_select" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- SAMPLE DATA (utilizadores de teste)
-- NOTA: Criar os users primeiro no Supabase Auth Dashboard
--       depois executar este INSERT com os UUIDs corretos
-- ============================================================
-- INSERT INTO public.users (id, email, name, role) VALUES
--   ('{UUID_DIRECTOR}', 'director@campgecko.com', 'Director Gecko', 'director'),
--   ('{UUID_M1}', 'monitor1@campgecko.com', 'Monitor 1', 'monitor'),
--   ('{UUID_M2}', 'monitor2@campgecko.com', 'Monitor 2', 'monitor'),
--   ('{UUID_M3}', 'monitor3@campgecko.com', 'Monitor 3', 'monitor'),
--   ('{UUID_ADMIN}', 'admin@campgecko.com', 'Admin Gecko', 'admin');
