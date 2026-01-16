const { useState } = React;

const CurrentWave = ({ today, todayKin, seals, tones, currentWaveOffset, setCurrentWaveOffset, waveData, updateDay, accentColor }) => {
  const seal = seals[todayKin.seal];
  const tone = tones[todayKin.tone - 1];

  const hexToRgba = (hex, a) => {
    const h = String(hex || '').replace('#', '');
    if (h.length !== 6) return `rgba(255,255,255,${a})`;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const accent = accentColor || seal?.color || '#F3F4F6';

  // Получить данные текущей волны
  const getCurrentWave = () => {
    try {
      // Используем переданный 'today' для синхронизации с домашним экраном
      const todayDate = new Date(today + 'T00:00:00');
      // Рассчитываем начало волны на основе тона текущего дня
      // Если сегодня тон 12, то начало волны = today - 11 дней (чтобы today был 12-м днем)
      const daysBackToWaveStart = (todayKin.tone - 1) + (Math.max(0, -currentWaveOffset) * 13);
      const waveStartDate = new Date(todayDate);
      waveStartDate.setDate(waveStartDate.getDate() - daysBackToWaveStart);

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

    const energyData = wave.days.map(d => {
      if (!d.energy) return 0;
      if (typeof d.energy === 'number') return d.energy;
      // Строка -> число
      const map = { 'Апатия': 1, 'Низкая': 1, 'Спад': 2, 'Средняя': 3, 'Подъём': 4, 'Высокая': 5 };
      return map[d.energy] || 0;
    });
    const maxEnergy = 5;
    const points = energyData.map((e, i) => {
      const x = (i / 12) * 100;
      const y = 100 - (e / maxEnergy) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div
        className="w-full h-32 rounded-3xl border bg-white/5 p-4 backdrop-blur-xl"
        style={{
          borderColor: hexToRgba(accent, 0.18),
          backgroundImage: `radial-gradient(900px circle at 10% 0%, ${hexToRgba(accent, 0.12)}, transparent 60%)`
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
              <stop offset="50%" stopColor={accent} stopOpacity="0.55" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.25" />
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
                fill={accent}
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

    const corner = index % 4;
    const cornerPos = corner === 0 ? '10% 0%' : corner === 1 ? '90% 0%' : corner === 2 ? '10% 100%' : '90% 100%';

    return (
      <div
        className="rounded-3xl border bg-white/5 p-5 backdrop-blur-xl"
        style={{
          borderColor: isToday ? hexToRgba(accent, 0.45) : 'rgba(255,255,255,0.10)',
          backgroundImage: `radial-gradient(900px circle at ${cornerPos}, ${hexToRgba(accent, isToday ? 0.16 : 0.10)}, transparent 60%)`,
          boxShadow: isToday ? `0 0 0 1px ${hexToRgba(accent, 0.22)}` : undefined
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-white/60">День {day.dayNumber}</div>
            <div className="mt-1 text-white font-semibold">{day.tone.name}</div>
            <div className="mt-1 text-xs font-medium" style={{ color: day.sealColor }}>{day.seal.name}</div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => {
                  window.tgHapticLight?.();
                  updateDayEnergy(day.date, level);
                }}
                className={`h-10 w-10 rounded-2xl border border-white/10 transition duration-300 active:scale-[0.96] ${day.energy === level ? energyColors[level] : 'bg-white/5 hover:bg-white/10'
                  }`}
              />
            ))}
          </div>
        </div>

        <textarea
          value={day.notes}
          onChange={(e) => updateDayNotes(day.date, e.target.value)}
          placeholder="Заметки дня..."
          className="mt-4 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 outline-none transition duration-300 focus:bg-white/10"
          rows="2"
        />

        <div className="mt-2 inline-flex items-center gap-2 text-xs text-white/50">
          {window.LucideReact?.Clock ? (
            <window.LucideReact.Clock size={14} strokeWidth={1.5} />
          ) : null}
          {getDayOfWeek(day.date)} • {day.date}
        </div>
      </div>
    );
  };

  // Функции обновления данных
  const updateDayEnergy = (date, energy) => {
    // energy уже число 1-5, передаем как есть
    updateDay(date, 'energy', energy);
  };

  const updateDayNotes = (date, notes) => {
    updateDay(date, 'notes', notes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 pb-24">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4">
        <div
          className="rounded-3xl border bg-white/5 p-5 backdrop-blur-xl"
          style={{
            borderColor: hexToRgba(accent, 0.18),
            backgroundImage: `radial-gradient(900px circle at 0% 0%, ${hexToRgba(accent, 0.14)}, transparent 55%)`
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold text-white">Волны Цолькин</div>
            <div className="text-white/60">
              {window.LucideReact?.Waves ? (
                <window.LucideReact.Waves size={20} strokeWidth={1.5} />
              ) : null}
            </div>
          </div>
          <div className="mt-1 text-sm text-white/60">Дневник паттернов энергии</div>
        </div>
      </div>

      {/* Wave Navigation */}
      <div className="max-w-2xl mx-auto mb-4 grid grid-cols-3 gap-2 items-stretch">
        <button
          onClick={() => {
            window.tgHapticLight?.();
            setCurrentWaveOffset(currentWaveOffset - 1);
          }}
          className="min-h-[50px] rounded-3xl border bg-white/5 px-4 py-3 text-white/90 transition duration-300 hover:bg-white/10 active:scale-[0.98]"
          style={{ borderColor: hexToRgba(accent, 0.16) }}
        >
          <span className="inline-flex items-center justify-center">
            {window.LucideReact?.ChevronLeft ? (
              <window.LucideReact.ChevronLeft size={20} strokeWidth={1.5} />
            ) : (
              '◀'
            )}
          </span>
        </button>

        <div
          className="min-h-[50px] rounded-3xl border bg-white/5 px-4 py-3 text-center backdrop-blur-xl"
          style={{
            borderColor: hexToRgba(accent, 0.18),
            backgroundImage: `radial-gradient(800px circle at 50% 0%, ${hexToRgba(accent, 0.10)}, transparent 60%)`
          }}
        >
          <div className="text-sm font-semibold text-white">Волна {Math.abs(currentWaveOffset) + 1}</div>
          <div className="mt-0.5 text-xs text-white/60">{currentWave.startDate}</div>
        </div>

        <button
          onClick={() => {
            window.tgHapticLight?.();
            setCurrentWaveOffset(currentWaveOffset + 1);
          }}
          disabled={currentWaveOffset >= 0}
          className="min-h-[50px] rounded-3xl border bg-white/5 px-4 py-3 text-white/90 transition duration-300 hover:bg-white/10 disabled:opacity-40 active:scale-[0.98]"
          style={{ borderColor: hexToRgba(accent, 0.16) }}
        >
          <span className="inline-flex items-center justify-center">
            {window.LucideReact?.ChevronRight ? (
              <window.LucideReact.ChevronRight size={20} strokeWidth={1.5} />
            ) : (
              '▶'
            )}
          </span>
        </button>
      </div>

      {/* Wave Graph */}
      <div className="max-w-2xl mx-auto mb-4">
        <WaveGraph wave={currentWave} />
      </div>

      {/* Days List */}
      <div className="max-w-2xl mx-auto space-y-3 pb-24">
        {currentWave.days.map((day, i) => (
          <DayCard key={i} day={day} index={i} />
        ))}
      </div>
    </div>
  );
};