const { useState } = React;

const CurrentWave = ({ today, todayKin, seals, tones, currentWaveOffset, setCurrentWaveOffset, waveData }) => {
  const seal = seals[todayKin.seal];
  const tone = tones[todayKin.tone - 1];

  // Получить данные текущей волны
  const getCurrentWave = () => {
    try {
      // Используем переданный 'today' для синхронизации с домашним экраном
      const todayDate = new Date(today + 'T00:00:00');
      // Рассчитываем начало волны: текущая волна начинается 12 дней назад
      // Каждая предыдущая волна на 13 дней раньше
      const totalDaysBack = 12 + (Math.max(0, -currentWaveOffset) * 13);
      const waveStartDate = new Date(todayDate);
      waveStartDate.setDate(waveStartDate.getDate() - totalDaysBack);

      // Форматируем дату начала волны
      const startYear = waveStartDate.getFullYear();
      const startMonth = String(waveStartDate.getMonth() + 1).padStart(2, '0');
      const startDay = String(waveStartDate.getDate()).padStart(2, '0');
      const startDateStr = `${startYear}-${startMonth}-${startDay}`;

      const wave = {
        startDate: startDateStr,
        days: []
      };

      // Генерируем 13 дней волны
      for (let i = 0; i < 13; i++) {
        const dayDate = new Date(waveStartDate);
        dayDate.setDate(waveStartDate.getDate() + i);

        const year = dayDate.getFullYear();
        const month = String(dayDate.getMonth() + 1).padStart(2, '0');
        const day = String(dayDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        wave.days.push({
          dayNumber: i + 1,
          date: dateStr,
          energy: waveData[dateStr]?.energy || null,
          notes: waveData[dateStr]?.notes || '',
          tone: tones[i % 13],
          seal: seals[i % 20],
          sealColor: seals[i % 20].color
        });
      }

      return wave;
    } catch (e) {
      console.error('Error in getCurrentWave:', e);
      return { startDate: '', days: [] };
    }
  };

  const currentWave = getCurrentWave();

  // Компонент графика волны
  const WaveGraph = ({ wave }) => {
    if (!wave) return null;

    const energyData = wave.days.map(d => d.energy || 0);
    const maxEnergy = 5;
    const points = energyData.map((e, i) => {
      const x = (i / 12) * 100;
      const y = 100 - (e / maxEnergy) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full h-32 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-4 mb-4">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#374151" strokeWidth="0.2" />
          ))}

          {/* Wave line */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Points */}
          {energyData.map((e, i) => {
            if (e === null) return null;
            const x = (i / 12) * 100;
            const y = 100 - (e / maxEnergy) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="#F59E0B"
                className="drop-shadow-lg"
              />
            );
          })}

          {/* Day markers */}
          {wave.days.map((_, i) => {
            const x = (i / 12) * 100;
            return (
              <text
                key={i}
                x={x}
                y="95"
                fontSize="3"
                fill="#9CA3AF"
                textAnchor="middle"
              >
                {i + 1}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  // Компонент карточки дня
  const DayCard = ({ day, index }) => {
    const energyColors = {
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-green-500',
      5: 'bg-blue-500'
    };

    // Получить день недели на русском
    const getDayOfWeek = (dateStr) => {
      const date = new Date(dateStr + 'T00:00:00');
      const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const dayIndex = (date.getDay() + 6) % 7; // Преобразуем Sunday=0 в Monday=0
      return daysOfWeek[dayIndex];
    };

    // Проверить, является ли день сегодняшним
    const isToday = day.date === today;

    return (
      <div className={`bg-gray-800/50 backdrop-blur rounded-lg p-4 mb-3 border ${isToday ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-gray-700'
        }`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-purple-400 text-sm">День {day.dayNumber}</div>
            <div className="text-white font-semibold">{day.tone.name}</div>
            <div className="text-xs font-medium" style={{ color: day.sealColor }}>{day.seal.name}</div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => {
                  window.tgHapticLight?.();
                  updateDayEnergy(day.date, level);
                }}
                className={`w-6 h-6 rounded ${day.energy === level ? energyColors[level] : 'bg-gray-700'
                  } transition`}
              />
            ))}
          </div>
        </div>
        <textarea
          value={day.notes}
          onChange={(e) => updateDayNotes(day.date, e.target.value)}
          placeholder="Заметки дня..."
          className="w-full bg-gray-900/50 text-white text-sm p-2 rounded border border-gray-600 focus:border-purple-500 outline-none"
          rows="2"
        />
        <div className="text-xs text-gray-500 mt-1">{getDayOfWeek(day.date)} • {day.date}</div>
      </div>
    );
  };

  // Функции обновления данных
  const updateDayEnergy = (date, energy) => {
    updateDay(date, 'energy', energy === 1 ? 'Низкая' : energy === 2 ? 'Спад' : energy === 3 ? 'Средняя' : energy === 4 ? 'Подъём' : 'Высокая');
  };

  const updateDayNotes = (date, notes) => {
    updateDay(date, 'notes', notes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 pb-20">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="text-3xl font-bold mb-2">🌀 Волны Цолькин</div>
        <div className="text-gray-400">Дневник паттернов энергии</div>
      </div>

      {/* Wave Navigation */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => {
            window.tgHapticLight?.();
            setCurrentWaveOffset(currentWaveOffset - 1);
          }}
          className="p-2 bg-gray-800 rounded-lg text-2xl hover:bg-gray-700"
        >
          ◀
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold">Волна {Math.abs(currentWaveOffset) + 1}</div>
          <div className="text-sm text-gray-400">{currentWave.startDate}</div>
        </div>
        <button
          onClick={() => {
            window.tgHapticLight?.();
            setCurrentWaveOffset(currentWaveOffset + 1);
          }}
          disabled={currentWaveOffset >= 0}
          className="p-2 bg-gray-800 rounded-lg disabled:opacity-30 text-2xl hover:bg-gray-700"
        >
          ▶
        </button>
      </div>

      {/* Wave Graph */}
      <div className="max-w-2xl mx-auto mb-6">
        <WaveGraph wave={currentWave} />
      </div>

      {/* Days List */}
      <div className="max-w-2xl mx-auto space-y-3 pb-20">
        {currentWave.days.map((day, i) => (
          <DayCard key={i} day={day} index={i} />
        ))}
      </div>
    </div>
  );
};