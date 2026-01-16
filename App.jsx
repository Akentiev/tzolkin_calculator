const { useState, useEffect } = React;

window.tgHapticLight = window.tgHapticLight || (() => {
  try {
    window?.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
  } catch (_) {
    // ignore
  }
});

const { createClient } = supabase;

const supabaseClient = createClient(
  'https://riuqfxredmzrglegfmxd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpdXFmeHJlZG16cmdsZWdmbXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjI3OTIsImV4cCI6MjA4MjM5ODc5Mn0.680PpZjhfZdeK4o2KS_bY3HDHezsc7k8gncUXwwshaU'
);

const getUserId = () => {
  let id = localStorage.getItem('user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user_id', id);
  }
  return id;
};

const pad2 = (n) => String(n).padStart(2, '0');
const formatDateLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
const leapYearsBeforeYear = (y) => {
  const n = y - 1;
  if (n < 0) return 0;
  return Math.floor(n / 4) - Math.floor(n / 100) + Math.floor(n / 400);
};
const leapDaysBeforeDate = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  // Count Feb 29 that happened strictly before this date.
  return leapYearsBeforeYear(y) + (isLeapYear(y) && m > 2 ? 1 : 0);
};

// Calculate Julian Day Number from Gregorian date
const gregorianToJulianDay = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
};

// Calculate Long Count from Julian Day (GMT correlation: 584283)
const julianDayToLongCount = (jdn) => {
  const GMT_CORRELATION = 584283;
  const daysSinceCreation = jdn - GMT_CORRELATION;

  const baktun = Math.floor(daysSinceCreation / 144000);
  const katun = Math.floor((daysSinceCreation % 144000) / 7200);
  const tun = Math.floor((daysSinceCreation % 7200) / 360);
  const winal = Math.floor((daysSinceCreation % 360) / 20);
  const kin = ((daysSinceCreation % 20) + 20) % 20;

  return { baktun, katun, tun, winal, kin, total: daysSinceCreation };
};

// Calculate Tzolkin from Long Count
const longCountToTzolkin = (longCount) => {
  const totalDays = longCount.total;
  const tzolkinPosition = ((totalDays % 260) + 260) % 260;

  const tone = (tzolkinPosition % 13) + 1;
  const seal = tzolkinPosition % 20;
  const kin = tzolkinPosition + 1;

  return { kin, tone, seal };
};

const calculateKin = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const isLeapDay = m === 2 && d === 29;
  const effectiveDate = isLeapDay ? new Date(y, 1, 28) : date;

  const adjustedSerial = (dt) => gregorianToJulianDay(dt) - leapDaysBeforeDate(dt);

  // Anchor to match your reference screenshots:
  // 2026-01-14 => Kin 36 (Tone 10, Seal 16 Warrior)
  const anchorDate = new Date('2026-01-14T00:00:00');
  const anchorKin = 36;
  const anchorSerial = adjustedSerial(anchorDate);
  const serial = adjustedSerial(effectiveDate);

  let pos = (anchorKin - 1 + (serial - anchorSerial)) % 260;
  pos = (pos + 260) % 260;

  const kin = pos + 1;
  const tone = (pos % 13) + 1;
  const seal = (pos % 20);
  return { kin, tone, seal };
};

const TzolkinTracker = () => {
  const [selectedDate, setSelectedDate] = useState(() => formatDateLocal(new Date()));
  const [todayKin, setTodayKin] = useState(() => calculateKin(selectedDate));
  const [waveData, setWaveData] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentWaveOffset, setCurrentWaveOffset] = useState(0);
  const [todayAnswers, setTodayAnswers] = useState({
    energy: null,
    resonance: null,
    action: null,
    project: null,
    insight: null,
    notes: ''
  });

  const [dayAdvice, setDayAdvice] = useState('');
  const [waveAnalysis, setWaveAnalysis] = useState('');
  const [loadingDay, setLoadingDay] = useState(false);
  const [loadingWave, setLoadingWave] = useState(false);
  const [savingDay, setSavingDay] = useState(false);

  // Маппинг энергии: строка -> число 1-5
  const energyToNumber = (energyLabel) => {
    const map = {
      'Апатия': 1,
      'Низкая': 1,
      'Спад': 2,
      'Средняя': 3,
      'Подъём': 4,
      'Высокая': 5
    };
    return map[energyLabel] || null;
  };

  // Обратный маппинг: число -> строка (для отображения)
  const numberToEnergy = (num) => {
    const map = { 1: 'Низкая', 2: 'Спад', 3: 'Средняя', 4: 'Подъём', 5: 'Высокая' };
    return map[num] || null;
  };

  const seals = [
    { name: 'Красный Дракон', essence: 'Рождение, питание, изначальная энергия', element: 'Огонь', color: '#DC2626' },
    { name: 'Белый Ветер', essence: 'Дух, дыхание, коммуникация', element: 'Воздух', color: '#F3F4F6' },
    { name: 'Синяя Ночь', essence: 'Мечта, изобилие, интуиция', element: 'Вода', color: '#2563EB' },
    { name: 'Желтое Семя', essence: 'Потенциал, посев, осознание', element: 'Земля', color: '#F59E0B' },
    { name: 'Красная Змея', essence: 'Инстинкт, страсть, жизненная сила', element: 'Огонь', color: '#DC2626' },
    { name: 'Белый Соединитель', essence: 'Трансформация, отпускание', element: 'Воздух', color: '#F3F4F6' },
    { name: 'Синяя Рука', essence: 'Знание, исцеление, свершение', element: 'Вода', color: '#2563EB' },
    { name: 'Желтая Звезда', essence: 'Красота, гармония, искусство', element: 'Земля', color: '#F59E0B' },
    { name: 'Красная Луна', essence: 'Поток, очищение, эмоции', element: 'Огонь', color: '#DC2626' },
    { name: 'Белая Собака', essence: 'Любовь, преданность, сердце', element: 'Воздух', color: '#F3F4F6' },
    { name: 'Синяя Обезьяна', essence: 'Игра, магия, радость', element: 'Вода', color: '#2563EB' },
    { name: 'Желтый Человек', essence: 'Свобода воли, мудрость', element: 'Земля', color: '#F59E0B' },
    { name: 'Красный Странник', essence: 'Исследование, пробуждение', element: 'Огонь', color: '#DC2626' },
    { name: 'Белый Маг', essence: 'Восприимчивость, шаман', element: 'Воздух', color: '#F3F4F6' },
    { name: 'Синий Орел', essence: 'Видение, перспектива, разум', element: 'Вода', color: '#2563EB' },
    { name: 'Желтый Воин', essence: 'Бесстрашие, вопросы, интеллект', element: 'Земля', color: '#F59E0B' },
    { name: 'Красная Земля', essence: 'Синхронность, знаки, эволюция', element: 'Огонь', color: '#DC2626' },
    { name: 'Белое Зеркало', essence: 'Отражение, порядок, бесконечность', element: 'Воздух', color: '#F3F4F6' },
    { name: 'Синяя Буря', essence: 'Трансформация, катализатор', element: 'Вода', color: '#2563EB' },
    { name: 'Желтое Солнце', essence: 'Просветление, мастерство, свет', element: 'Земля', color: '#F59E0B' }
  ];

  const tones = [
    { n: 1, name: 'Хун', essence: 'Единство, намерение, цель', phase: 'посев', action: 'Заложить намерение' },
    { n: 2, name: 'Ка', essence: 'Дуальность, вызов, полярность', phase: 'посев', action: 'Встретить вызов' },
    { n: 3, name: 'Ош', essence: 'Активация, действие, ритм', phase: 'посев', action: 'Начать движение' },
    { n: 4, name: 'Кан', essence: 'Форма, структура, мера', phase: 'посев', action: 'Придать форму' },
    { n: 5, name: 'Хо', essence: 'Расширение, сила, центр', phase: 'подъём', action: 'Расширить влияние' },
    { n: 6, name: 'Уак', essence: 'Баланс, поток, организация', phase: 'подъём', action: 'Найти баланс' },
    { n: 7, name: 'Уук', essence: 'Резонанс, мистика, настройка', phase: 'пик', action: 'Настроиться на поток' },
    { n: 8, name: 'Уашак', essence: 'Целостность, гармония', phase: 'трансформация', action: 'Интегрировать' },
    { n: 9, name: 'Болон', essence: 'Завершение, терпение', phase: 'трансформация', action: 'Отпустить старое' },
    { n: 10, name: 'Лахун', essence: 'Проявление, производство', phase: 'интеграция', action: 'Проявить результат' },
    { n: 11, name: 'Хунлахун', essence: 'Освобождение, изменение', phase: 'интеграция', action: 'Освободиться' },
    { n: 12, name: 'Каблахун', essence: 'Кооперация, комплексность', phase: 'интеграция', action: 'Объединить усилия' },
    { n: 13, name: 'Ошлахун', essence: 'Трансценденция, магия', phase: 'завершение', action: 'Превзойти себя' }
  ];

  const questions = {
    energy: {
      q: '1. Энергия сегодня',
      options: ['Высокая', 'Подъём', 'Средняя', 'Спад', 'Низкая', 'Апатия']
    },
    resonance: {
      q: '2. Резонанс с печатью',
      options: ['Ясно вижу', 'Частично', 'Слабо', 'Не вижу', 'Не понял']
    },
    action: {
      q: '3. Делать или быть?',
      options: ['Делать', 'Активен', '50/50', 'Пассивен', 'Быть', 'Не знаю']
    },
    project: {
      q: '4. Где в проекте?',
      options: ['Пауза', 'Идея', 'Начало', 'Реализация', 'Завершение', 'Сдал']
    },
    insight: {
      q: '5. Ключевое событие',
      options: ['Прорыв', 'Знак', 'Синхрония', 'Вызов', 'Тупик', 'Обычный день']
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = getUserId();
        const { data, error } = await supabaseClient
          .from('user_days')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) throw error;

        const waveObj = {};
        data.forEach(row => {
          const kinData = calculateKin(row.date);
          waveObj[row.date] = { ...row, ...kinData };
        });
        setWaveData(waveObj);
      } catch (e) {
        console.log('Ошибка загрузки:', e);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const kinData = calculateKin(selectedDate);
    setTodayKin(kinData);

    const entry = waveData[selectedDate];
    if (entry) {
      // Если energy число, конвертируем в строку для UI
      const energyLabel = typeof entry.energy === 'number' ? numberToEnergy(entry.energy) : entry.energy;
      setTodayAnswers({
        energy: energyLabel ?? null,
        resonance: entry.resonance ?? null,
        action: entry.action ?? null,
        project: entry.project ?? null,
        insight: entry.insight ?? null,
        notes: entry.notes ?? ''
      });
    } else {
      setTodayAnswers({
        energy: null,
        resonance: null,
        action: null,
        project: null,
        insight: null,
        notes: ''
      });
    }

    setDayAdvice('');
  }, [selectedDate, waveData]);

  const saveAnswers = async () => {
    setSavingDay(true);
    const userId = getUserId();

    try {
      // Преобразуем энергию в число 1-5
      const energyNumber = energyToNumber(todayAnswers.energy);

      // Вызываем API для структурирования данных (режим секретаря)
      let aiSummary = null;
      let aiEvents = null;

      if (todayAnswers.notes || todayAnswers.insight) {
        try {
          const aiResponse = await fetch('/api/analyze-day', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'structure',
              dayData: {
                tone: todayKin.tone,
                seal: seals[todayKin.seal].name,
                energy: energyNumber,
                ...todayAnswers
              }
            })
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            aiSummary = aiData.ai_summary;
            aiEvents = aiData.ai_events;
          } else {
            console.log('AI структурирование недоступно, статус:', aiResponse.status);
          }
        } catch (aiError) {
          console.log('AI структурирование пропущено:', aiError.message);
        }
      }

      const dataToSave = {
        user_id: userId,
        date: selectedDate,
        kin: todayKin.kin,
        tone: todayKin.tone,
        seal: todayKin.seal,
        energy: energyNumber,
        resonance: todayAnswers.resonance,
        action: todayAnswers.action,
        project: todayAnswers.project,
        insight: todayAnswers.insight,
        notes: todayAnswers.notes,
        ai_summary: aiSummary,
        ai_events: aiEvents || null
      };

      const { error } = await supabaseClient
        .from('user_days')
        .upsert(dataToSave, { onConflict: 'user_id,date' });

      if (error) throw error;

      setWaveData({ ...waveData, [selectedDate]: dataToSave });

      // Обновляем локальный todayAnswers, чтобы ai_summary и ai_events сразу были в стейте
      setTodayAnswers(prev => ({
        ...prev,
        ai_summary: aiSummary,
        ai_events: aiEvents
      }));

      // Haptic feedback и переход на волну
      window.tgHapticLight?.();
      setCurrentScreen('wave');

    } catch (e) {
      console.error('Ошибка:', e);
      alert('❌ Ошибка сохранения: ' + e.message);
    } finally {
      setSavingDay(false);
    }
  };

  const analyzeDayWithClaude = async () => {
    setLoadingDay(true);
    try {
      const energyNumber = energyToNumber(todayAnswers.energy);

      const response = await fetch('/api/analyze-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'advice',
          dayData: {
            tone: todayKin.tone,
            seal: seals[todayKin.seal].name,
            energy: energyNumber,
            ...todayAnswers
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Сервер вернул ошибку ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      setDayAdvice(data.advice);
    } catch (e) {
      console.error('Ошибка анализа:', e);
      alert('Ошибка анализа: ' + e.message + '\n\nПроверьте что API запущен на Vercel или используйте production URL.');
    }
    setLoadingDay(false);
  };

  const analyzeWaveWithClaude = async () => {
    const entries = Object.entries(waveData).filter(([_, v]) => v.energy);
    if (entries.length < 13) {
      alert('Нужно заполнить все 13 дней');
      return;
    }

    setLoadingWave(true);
    try {
      const response = await fetch('/api/analyze-wave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waveDays: entries.map(([date, data]) => ({
            date,
            tone: data.tone,
            ...data
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Сервер вернул ошибку ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      setWaveAnalysis(data.analysis);
    } catch (e) {
      console.error('Ошибка анализа волны:', e);
      alert('Ошибка анализа: ' + e.message);
    }
    setLoadingWave(false);
  };

  const updateDay = async (date, field, value) => {
    const updatedData = { ...waveData };
    if (!updatedData[date]) {
      const kinData = calculateKin(date);
      updatedData[date] = {
        user_id: getUserId(),
        date,
        kin: kinData.kin,
        tone: kinData.tone,
        seal: kinData.seal
      };
    }

    // Если поле energy - конвертируем строку в число
    if (field === 'energy' && typeof value === 'string') {
      updatedData[date][field] = energyToNumber(value);
    } else {
      updatedData[date][field] = value;
    }

    try {
      const { error } = await supabaseClient
        .from('user_days')
        .upsert(updatedData[date], { onConflict: 'user_id,date' });

      if (error) throw error;

      setWaveData(updatedData);
    } catch (e) {
      console.error('Ошибка сохранения:', e);
    }
  };

  if (!todayKin) return null;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'fullCalendar':
        return <FullCalendarScreen
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          seals={seals}
          tones={tones}
        />;
      case 'wave':
        return <CurrentWave
          today={selectedDate}
          todayKin={todayKin}
          seals={seals}
          tones={tones}
          accentColor={seals?.[todayKin.seal]?.color}
          questions={questions}
          waveData={waveData}
          todayAnswers={todayAnswers}
          setTodayAnswers={setTodayAnswers}
          saveAnswers={saveAnswers}
          analyzeDayWithClaude={analyzeDayWithClaude}
          dayAdvice={dayAdvice}
          loadingDay={loadingDay}
          currentWaveOffset={currentWaveOffset}
          setCurrentWaveOffset={setCurrentWaveOffset}
          updateDay={updateDay}
        />;
      case 'history':
        return <WaveHistoryScreen
          waveData={waveData}
          selectedDate={selectedDate}
          todayKin={todayKin}
          accentColor={seals?.[todayKin.seal]?.color}
          setShowWaveHistory={() => { }}
          setCurrentWaveOffset={setCurrentWaveOffset}
          setCurrentScreen={setCurrentScreen}
        />;
      default:
        return (
          <HomeScreen
            selectedDate={selectedDate}
            todayKin={todayKin}
            seals={seals}
            tones={tones}
            questions={questions}
            waveData={waveData}
            todayAnswers={todayAnswers}
            setTodayAnswers={setTodayAnswers}
            saveAnswers={saveAnswers}
            analyzeDayWithClaude={analyzeDayWithClaude}
            dayAdvice={dayAdvice}
            loadingDay={loadingDay}
            savingDay={savingDay}
            setCurrentScreen={setCurrentScreen}
          />
        );
    }
  };

  if (currentScreen === 'tutorial') {
    return (
      <div className="min-h-screen text-white">
        <TutorialScreen seals={seals} tones={tones} setShowTutorial={() => setCurrentScreen('home')} />
        <BottomNavigation currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {renderScreen()}
      <BottomNavigation currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TzolkinTracker />);