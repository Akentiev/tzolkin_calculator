const { useState, useEffect } = React;

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

const calculateKin = (dateStr) => {
  const date = new Date(dateStr);
  const baseDate = new Date('1982-03-05');
  const baseKin = 22;
  const daysDiff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
  const kin = ((baseKin + daysDiff - 1) % 260) + 1;
  const tone = ((kin - 1) % 13) + 1;
  const seal = ((kin - 1) % 20);
  return { kin, tone, seal };
};

const TzolkinTracker = () => {
  const [todayKin, setTodayKin] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return calculateKin(today);
  });
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
    const today = new Date().toISOString().split('T')[0];
    const kinData = calculateKin(today);
    setTodayKin(kinData);
    
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
          waveObj[row.date] = row;
        });
        setWaveData(waveObj);
        
        if (waveObj[today]) {
          setTodayAnswers(waveObj[today]);
        }
      } catch (e) {
        console.log('Ошибка загрузки:', e);
      }
    };
    
    loadData();
  }, []);

  const saveAnswers = async () => {
    const today = new Date().toISOString().split('T')[0];
    const userId = getUserId();
    
    const dataToSave = {
      user_id: userId,
      date: today,
      kin: todayKin.kin,
      tone: todayKin.tone,
      seal: todayKin.seal,
      ...todayAnswers
    };
    
    try {
      const { error } = await supabaseClient
        .from('user_days')
        .upsert(dataToSave, { onConflict: 'user_id,date' });
      
      if (error) throw error;
      
      setWaveData({ ...waveData, [today]: dataToSave });
      alert('✓ Сохранено!');
    } catch (e) {
      console.error('Ошибка:', e);
      alert('❌ Ошибка: ' + e.message);
    }
  };

  const analyzeDayWithClaude = async () => {
    setLoadingDay(true);
    try {
      const response = await fetch('/api/analyze-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dayData: {
            tone: todayKin.tone,
            seal: seals[todayKin.seal].name,
            ...todayAnswers
          }
        })
      });
      
      const data = await response.json();
      setDayAdvice(data.advice);
    } catch (e) {
      alert('Ошибка анализа: ' + e.message);
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
      
      const data = await response.json();
      setWaveAnalysis(data.analysis);
    } catch (e) {
      alert('Ошибка анализа: ' + e.message);
    }
    setLoadingWave(false);
  };

  const updateDay = async (date, field, value) => {
    const updatedData = { ...waveData };
    if (!updatedData[date]) {
      updatedData[date] = { user_id: getUserId(), date };
    }
    updatedData[date][field] = value;
    
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
      case 'wave':
        return <CurrentWave
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
          currentWaveOffset={currentWaveOffset}
          setCurrentWaveOffset={setCurrentWaveOffset}
          updateDay={updateDay}
        />;
      case 'history':
        return <WaveHistoryScreen 
          waveData={waveData} 
          setShowWaveHistory={() => {}} 
          setCurrentWaveOffset={setCurrentWaveOffset}
          setCurrentScreen={setCurrentScreen}
        />;
      default:
        return (
          <div>
            {/* Навигация */}
            <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-purple-300">Tzolk'in Tracker</h1>
              <button
                onClick={() => setCurrentScreen('tutorial')}
                className="bg-gray-600 hover:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition"
                title="Обучение"
              >
                ℹ️
              </button>
            </div>

            <HomeScreen
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
              setCurrentScreen={setCurrentScreen}
            />
          </div>
        );
    }
  };

  if (currentScreen === 'tutorial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <TutorialScreen seals={seals} tones={tones} setShowTutorial={() => setCurrentScreen('home')} />
        <BottomNavigation currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 pb-20">
      {renderScreen()}
      <BottomNavigation currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TzolkinTracker />);