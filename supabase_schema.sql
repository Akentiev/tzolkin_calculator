-- Таблица для хранения профилей пользователей
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем старую таблицу, если она существует
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  user_id TEXT PRIMARY KEY,
  name TEXT,
  birth_date DATE,
  tzolkin_kin INTEGER,
  tzolkin_tone INTEGER,
  tzolkin_seal INTEGER,
  syucai_consciousness INTEGER CHECK (syucai_consciousness BETWEEN 1 AND 9),
  syucai_mission INTEGER CHECK (syucai_mission BETWEEN 1 AND 9),
  ai_portrait TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска по user_id (автоматически создается для PRIMARY KEY)
-- Дополнительный индекс для сортировки по дате обновления
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);

-- Row Level Security (RLS) - разрешаем всем операции с профилями
-- В production окружении следует настроить более строгие политики безопасности
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Политика: любой пользователь может читать, создавать и обновлять записи
CREATE POLICY "Profiles are accessible to all" ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE profiles IS 'Профили пользователей с данными Tzolkin и Syucai';
COMMENT ON COLUMN profiles.user_id IS 'Уникальный идентификатор пользователя из localStorage';
COMMENT ON COLUMN profiles.birth_date IS 'Дата рождения в формате YYYY-MM-DD';
COMMENT ON COLUMN profiles.tzolkin_kin IS 'Кин рождения (1-260) из календаря Цолькин';
COMMENT ON COLUMN profiles.tzolkin_tone IS 'Тон рождения (1-13) из календаря Цолькин';
COMMENT ON COLUMN profiles.tzolkin_seal IS 'Печать рождения (0-19) из календаря Цолькин';
COMMENT ON COLUMN profiles.syucai_consciousness IS 'Число Сознания (1-9) из системы Сюцай';
COMMENT ON COLUMN profiles.syucai_mission IS 'Число Миссии (1-9) из системы Сюцай';
COMMENT ON COLUMN profiles.ai_portrait IS 'AI-сгенерированный психологический портрет';
