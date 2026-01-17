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

      // Генерируем 13 дней волны с правильным расчетом тона и печати
      for (let i = 0; i < 13; i++) {
        const dayDate = new Date(waveStartDate);
        dayDate.setDate(waveStartDate.getDate() + i);

        const year = dayDate.getFullYear();
        const month = String(dayDate.getMonth() + 1).padStart(2, '0');
        const day = String(dayDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Новый расчет тона и печати через calculateKin
        const kinData = typeof calculateKin === 'function' ? calculateKin(dateStr) : { tone: (i % 13) + 1, seal: i % 20 };

        wave.days.push({
          dayNumber: i + 1,
          date: dateStr,
          data: waveData[dateStr] || null,
          energy: waveData[dateStr]?.energy || null,
          notes: waveData[dateStr]?.notes || '',
          tone: tones[kinData.tone - 1],
          seal: seals[kinData.seal],
          sealColor: seals[kinData.seal].color
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
    const validEnergies = energyData.filter(e => e > 0);
    const minEnergy = validEnergies.length ? Math.min(...validEnergies) : 0;
    const maxEnergy = validEnergies.length ? Math.max(...validEnergies) : 5;
    const range = Math.max(1, maxEnergy - minEnergy);
    const topPad = 8;
    const bottomPad = 12;
    const usableHeight = 100 - topPad - bottomPad;

    const points = energyData.map((e, i) => {
      const x = (i / 12) * 100;
      const normalized = e > 0 ? (e - minEnergy) / range : 0;
      const y = 100 - bottomPad - (normalized * usableHeight);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
            </linearGradient>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[20, 40, 60, 80].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.3" />
          ))}

          {/* Glow effect under line */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            filter="url(#neonGlow)"
          />

          {/* Main Wave line */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neonGlow)"
          />

          {/* Points with neon glow */}
          {energyData.map((e, i) => {
            if (e === 0) return null;
            const x = (i / 12) * 100;
            const normalized = (e - minEnergy) / range;
            const y = 100 - bottomPad - (normalized * usableHeight);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#06b6d4"
                  opacity="0.3"
                  filter="url(#neonGlow)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#ffffff"
                  stroke="#06b6d4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Day markers */}
          {wave.days.map((_, i) => {
            const x = (i / 12) * 100;
            return (
              <text
                key={i}
                x={x}
                y="99"
                fontSize="3"
                fill="rgba(255, 255, 255, 0.35)"
                textAnchor="middle"
                fontWeight="300"
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

    // Получить фазу дня из day.tone.phase
    const phase = day.tone && day.tone.phase ? day.tone.phase : '';

    // ai_summary, ai_events, notes, fallback
    const ai_summary = (day.data && day.data.ai_summary) || day.ai_summary;
    const ai_events = (day.data && day.data.ai_events) || day.ai_events;
    const notes = (day.data && day.data.notes) || day.notes;
    let mainText = '';
    if (ai_summary || (Array.isArray(ai_events) && ai_events.length > 0)) {
      mainText = '';
    } else if (notes && notes.trim()) {
      mainText = notes;
    } else {
      mainText = 'Данные не заполнены';
    }

    // Энергия как X/5
    const energyValue = typeof day.energy === 'number' ? day.energy : (typeof day.energy === 'string' ? ({ 'Апатия': 1, 'Низкая': 1, 'Спад': 2, 'Средняя': 3, 'Подъём': 4, 'Высокая': 5 }[day.energy] || null) : null);
    const energyText = energyValue ? `${energyValue}/5` : '—/5';

    return (
      <div
        className="rounded-3xl glass-card p-5 transition-all duration-300 hover:scale-[1.01]"
        style={{
          borderColor: isToday ? hexToRgba(accent, 0.5) : 'rgba(255,255,255,0.12)',
          backgroundImage: `radial-gradient(900px circle at ${cornerPos}, ${hexToRgba(accent, isToday ? 0.20 : 0.10)}, transparent 60%)`,
          boxShadow: isToday
            ? `0 0 25px ${hexToRgba(accent, 0.25)}, 0 0 0 1.5px ${hexToRgba(accent, 0.3)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium" style={{ color: day.sealColor }}>
                {day.dayNumber} {day.seal.name}
              </div>
              {isToday && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">Сегодня</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end min-w-[80px]">
            <div
              className="text-xs px-2 py-1 rounded-lg mb-2 font-medium"
              style={{
                background: `linear-gradient(135deg, ${hexToRgba(accent, 0.15)}, ${hexToRgba(accent, 0.08)})`,
                border: `1px solid ${hexToRgba(accent, 0.25)}`,
                color: accent
              }}
            >
              {phase}
            </div>
            <div className="text-2xl font-bold" style={{
              color: energyValue >= 4 ? '#10b981' : energyValue >= 3 ? '#fbbf24' : '#ef4444'
            }}>
              {energyText}
            </div>
          </div>
        </div>

        {/* AI summary/events или notes или fallback */}
        {ai_summary || (Array.isArray(ai_events) && ai_events.length > 0) ? (
          <div className="mt-4">
            {ai_summary && (
              <div className="font-semibold text-white mb-1">{ai_summary}</div>
            )}
            {Array.isArray(ai_events) && ai_events.length > 0 && (
              <ul className="list-disc list-inside text-white/80 text-sm">
                {ai_events.map((ev, idx) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="mt-4 text-white/70 text-sm whitespace-pre-line">{mainText}</div>
        )}

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
    <div className="min-h-screen text-white p-4 pb-32 fade-in">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold tracking-wide text-white">Волны Цолькин</div>
            <div className="mt-1.5 text-sm text-white/50 font-light">Дневник паттернов энергии</div>
          </div>
          <div className="text-white/70">
            {window.LucideReact?.Waves ? (
              <window.LucideReact.Waves size={26} strokeWidth={2} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Wave Navigation */}
      <div className="max-w-2xl mx-auto mb-6 grid grid-cols-3 gap-3 items-stretch">
        <button
          onClick={() => {
            window.tgHapticLight?.();
            setCurrentWaveOffset(currentWaveOffset - 1);
          }}
          className="min-h-[56px] rounded-3xl px-4 py-3 text-white/90 transition-all duration-300 hover:bg-white/5 active:scale-[0.95]"
        >
          <span className="inline-flex items-center justify-center">
            {window.LucideReact?.ChevronLeft ? (
              <window.LucideReact.ChevronLeft size={22} strokeWidth={2} />
            ) : (
              '◀'
            )}
          </span>
        </button>

        <div className="min-h-[56px] px-4 py-3 text-center">
          <div className="text-sm font-bold text-white tracking-wide">Волна {Math.abs(currentWaveOffset) + 1}</div>
          <div className="mt-0.5 text-xs text-white/50">{currentWave.startDate}</div>
        </div>

        <button
          onClick={() => {
            window.tgHapticLight?.();
            setCurrentWaveOffset(currentWaveOffset + 1);
          }}
          disabled={currentWaveOffset >= 0}
          className="min-h-[56px] rounded-3xl px-4 py-3 text-white/90 transition-all duration-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.95]"
        >
          <span className="inline-flex items-center justify-center">
            {window.LucideReact?.ChevronRight ? (
              <window.LucideReact.ChevronRight size={22} strokeWidth={2} />
            ) : (
              '▶'
            )}
          </span>
        </button>
      </div>

      {/* Wave Graph */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <WaveGraph wave={currentWave} />
      </div>

      {/* Days List */}
      <div className="max-w-2xl mx-auto space-y-4 pb-6">
        {currentWave.days.map((day, i) => (
          <DayCard key={i} day={day} index={i} />
        ))}
      </div>
    </div>
  );
};