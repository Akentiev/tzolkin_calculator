# Настройка Supabase для Tzolkin Tracker

## 1. Создание таблицы profiles

1. Откройте Supabase Dashboard для вашего проекта
2. Перейдите в **SQL Editor**
3. Скопируйте и выполните содержимое файла `supabase_schema.sql`

Альтернативно, вы можете выполнить следующий SQL-запрос:

```sql
CREATE TABLE IF NOT EXISTS profiles (
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are accessible to all" ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## 2. Проверка структуры

После создания таблицы убедитесь, что:

- ✅ Поле `user_id` является **Primary Key**
- ✅ Row Level Security (RLS) включен
- ✅ Политика безопасности создана и активна

Проверить можно в разделе **Table Editor** → **profiles** → **Settings**

## 3. Как работает синхронизация

### При загрузке приложения:
1. Приложение сначала пытается загрузить профиль из Supabase
2. Если профиль не найден, загружает из localStorage
3. При наличии профиля в localStorage (но отсутствии в Supabase) — автоматически синхронизирует

### При сохранении профиля:
1. Профиль сохраняется в **localStorage** (для офлайн-доступа)
2. Одновременно отправляется в **Supabase** через `.upsert()` с `onConflict: 'user_id'`
3. Если сохранение в Supabase не удалось — профиль остается в localStorage и будет синхронизирован при следующей загрузке

## 4. Структура данных

### В Supabase (таблица profiles):
```
user_id: "user_abc123xyz"
name: "Иван"
birth_date: "1990-05-15"
tzolkin_kin: 36
tzolkin_tone: 10
tzolkin_seal: 16
syucai_consciousness: 3
syucai_mission: 7
ai_portrait: "Вы обладаете..."
updated_at: "2026-01-19T12:00:00Z"
```

### В localStorage (ключ userProfile):
```json
{
  "name": "Иван",
  "birthDate": "1990-05-15",
  "tzolkinBirth": {
    "kin": 36,
    "tone": 10,
    "seal": 16
  },
  "syucai": {
    "consciousness": 3,
    "mission": 7
  },
  "aiPortrait": "Вы обладаете..."
}
```

## 5. Отладка

### Проверка сохранения профиля:

Откройте консоль браузера (F12) и выполните:

```javascript
// Проверка user_id
console.log('User ID:', window.getUserId());

// Проверка localStorage
console.log('localStorage profile:', localStorage.getItem('userProfile'));

// Ручное сохранение в Supabase
const userId = window.getUserId();
const profile = JSON.parse(localStorage.getItem('userProfile'));
window.saveProfileToSupabase(userId, profile).then(result => {
  console.log('Save result:', result);
});
```

### Проверка в Supabase:

```sql
-- Посмотреть все профили
SELECT * FROM profiles;

-- Найти конкретный профиль
SELECT * FROM profiles WHERE user_id = 'user_abc123xyz';
```

## 6. Безопасность (Production)

⚠️ **Важно**: В production-окружении следует настроить более строгие RLS политики:

```sql
-- Удалить открытую политику
DROP POLICY "Profiles are accessible to all" ON profiles;

-- Создать политику для аутентифицированных пользователей (если используете Supabase Auth)
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
```

## 7. Миграция существующих данных

Если у пользователей уже есть профили в localStorage, они автоматически синхронизируются при первой загрузке приложения после обновления.

Никаких дополнительных действий не требуется.
