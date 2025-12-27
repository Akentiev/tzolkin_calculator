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

const TzolkinTracker = () => {
  const [todayKin, setTodayKin] = useState(null);
  const [waveData, setWaveData] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
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

  const analyzePattern = () => {
    const entries = Object.entries(waveData).filter(([_, v]) => v.energy);
    if (entries.length < 5) {
      return 'Недостаточно данных. Заполните минимум 5 дней для анализа паттерна.';
    }

    const energyByTone = {};
    const actionByTone = {};
    
    entries.forEach(([date, data]) => {
      const t = data.tone;
      if (!energyByTone[t]) energyByTone[t] = [];
      if (!actionByTone[t]) actionByTone[t] = [];
      energyByTone[t].push(data.energy);
      actionByTone[t].push(data.action);
    });

    const highEnergyTones = Object.entries(energyByTone)
      .filter(([_, vals]) => vals.some(v => ['Высокая', 'Подъём'].includes(v)))
      .map(([t]) => `Тон ${t}`);

    const lowEnergyTones = Object.entries(energyByTone)
      .filter(([_, vals]) => vals.some(v => ['Низкая', 'Апатия', 'Спад'].includes(v)))
      .map(([t]) => `Тон ${t}`);

    return `
📊 Ваш паттерн за ${entries.length} дней:

⚡ Высокая энергия: ${highEnergyTones.join(', ') || 'не выявлено'}
📉 Низкая энергия: ${lowEnergyTones.join(', ') || 'не выявлено'}

${entries.length >= 13 ? '✓ Полная волна пройдена! Паттерн виден чётко.' : `⏳ Осталось ${13 - entries.length} дней до полной волны.`}
    `.trim();
  };

  if (!todayKin) return null;

  const seal = seals[todayKin.seal];
  const tone = tones[todayKin.tone - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      
      {/* Сегодня */}
      <div className="max-w-2xl mx-auto mb-6 p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30">
        <div className="text-sm text-purple-300 mb-2">Сегодня • Кин {todayKin.kin}</div>
        <div className="text-5xl font-bold mb-3" style={{ color: seal.color }}>
          {todayKin.tone} {seal.name}
        </div>
        <div className="text-lg text-gray-300 mb-4">{seal.essence}</div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <div className="text-purple-300">Тон {tone.n} • {tone.name}</div>
            <div className="text-gray-400">{tone.essence}</div>
          </div>
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <div className="text-blue-300">Фаза: {tone.phase}</div>
            <div className="text-gray-400">{tone.action}</div>
          </div>
        </div>

        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-purple-400 flex items-center gap-2 text-sm hover:text-purple-300"
        >
          {showDetails ? '▲' : '▼'}
          {showDetails ? 'Скрыть детали' : 'Показать детали'}
        </button>

        {showDetails && (
          <div className="mt-4 space-y-2 text-sm text-gray-400 border-t border-gray-700 pt-4">
            <div><span className="text-purple-300">Стихия:</span> {seal.element}</div>
            <div><span className="text-purple-300">Действие дня:</span> {tone.action}</div>
            <div className="text-xs text-gray-500 mt-2">
              Это {todayKin.tone}-й день текущей 13-дневной волны. 
              {todayKin.tone <= 4 && ' Фаза посева и формирования.'}
              {todayKin.tone >= 5 && todayKin.tone <= 7 && ' Фаза подъёма и пика силы.'}
              {todayKin.tone >= 8 && todayKin.tone <= 9 && ' Фаза трансформации.'}
              {todayKin.tone >= 10 && todayKin.tone <= 12 && ' Фаза интеграции.'}
              {todayKin.tone === 13 && ' Завершение волны, кульминация.'}
            </div>
          </div>
        )}
      </div>

      {/* Вопросы */}
      <div className="max-w-2xl mx-auto mb-6 p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30">
        <div className="text-xl font-bold mb-4 text-purple-300">Отследить день</div>
        
        {Object.entries(questions).map(([key, { q, options }]) => (
          <div key={key} className="mb-4">
            <div className="text-sm text-gray-400 mb-2">{q}</div>
            <div className="grid grid-cols-3 gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setTodayAnswers({ ...todayAnswers, [key]: opt })}
                  className={`p-2 rounded-lg text-sm font-medium transition ${
                    todayAnswers[key] === opt
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4">
          <div className="text-sm text-gray-400 mb-2">Заметки (необязательно)</div>
          <textarea
            value={todayAnswers.notes}
            onChange={(e) => setTodayAnswers({ ...todayAnswers, notes: e.target.value })}
            className="w-full p-3 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:border-purple-500 outline-none"
            rows="3"
            placeholder="Ключевые события дня..."
          />
        </div>

        <button
          onClick={saveAnswers}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          💾 Сохранить день
        </button>

        {/* Анализ дня AI */}
        <div className="mt-6 p-4 bg-blue-900/30 rounded-xl border border-blue-500/30">
          <button
            onClick={analyzeDayWithClaude}
            disabled={!todayAnswers.energy || loadingDay}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg mb-3"
          >
            {loadingDay ? '⏳ Анализирую...' : '🤖 Совет AI на сегодня'}
          </button>
          
          {dayAdvice && (
            <div className="p-4 bg-blue-500/20 rounded-lg text-sm text-gray-200">
              {dayAdvice}
            </div>
          )}
        </div>
      </div>

      {/* Анализ */}
      {Object.keys(waveData).length > 0 && (
        <div className="max-w-2xl mx-auto p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-blue-500/30">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between text-blue-300 font-bold text-lg"
          >
            <span className="flex items-center gap-2">
              📊 Анализ паттерна
            </span>
            {showAnalysis ? '▲' : '▼'}
          </button>

          {showAnalysis && (
            <div className="mt-4 text-sm text-gray-300 whitespace-pre-line bg-gray-900/50 p-4 rounded-lg">
              {analyzePattern()}
            </div>
          )}

          <button
            onClick={analyzeWaveWithClaude}
            disabled={Object.keys(waveData).length < 13 || loadingWave}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg"
          >
            {loadingWave ? '⏳ Анализирую волну...' : '🔮 Анализ волны от AI'}
          </button>

          {waveAnalysis && (
            <div className="mt-4 p-4 bg-purple-500/20 rounded-lg text-sm text-gray-200 whitespace-pre-line">
              {waveAnalysis}
            </div>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto mt-6 text-center text-xs text-gray-500">
        Заполняйте каждый день. Через 13 дней вы увидите свой паттерн.
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TzolkinTracker />);