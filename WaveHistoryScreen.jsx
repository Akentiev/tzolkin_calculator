const WaveHistoryScreen = ({ waveData, selectedDate, todayKin, accentColor, setShowWaveHistory, setCurrentWaveOffset, setCurrentScreen, userProfile }) => {
  const [view, setView] = useState('current');
  const currentDate = selectedDate || new Date().toISOString().split('T')[0];

  const hexToRgba = (hex, a) => {
    const h = String(hex || '').replace('#', '');
    if (h.length !== 6) return `rgba(255,255,255,${a})`;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const accent = accentColor || '#F3F4F6';

  // Расчет личного дня (1-9) от даты рождения
  const calculatePersonalDay = (dateStr) => {
    if (!userProfile || !userProfile.birthDate) return null;

    const date = new Date(dateStr + 'T00:00:00');
    const birthDate = new Date(userProfile.birthDate + 'T00:00:00');

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const birthDay = birthDate.getDate();
    const birthMonth = birthDate.getMonth() + 1;

    const sumDigits = (n) => {
      return n.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    };

    // Сумма дня и месяца текущей даты + число сознания
    const dateSum = sumDigits(day) + sumDigits(month);
    const consciousness = userProfile.syucai?.consciousness || sumDigits(birthDay);

    let personalDay = dateSum + consciousness;
    while (personalDay > 9) {
      personalDay = sumDigits(personalDay);
    }

    return personalDay;
  };

  // Получить список всех волн
  const getWaves = () => {
    try {
      const waves = [];
      const today = new Date(currentDate + 'T00:00:00');

      // Начинаем с текущей волны (offset 0) и идем назад
      for (let offset = 0; offset >= -10; offset--) { // Показываем последние 10 волн
        // Рассчитываем начало волны на основе тона текущего дня
        // Если сегодня тон 12, то начало волны = today - 11 дней
        const daysBackToWaveStart = (todayKin.tone - 1) + (Math.max(0, -offset) * 13);
        const waveStartDate = new Date(today);
        waveStartDate.setDate(waveStartDate.getDate() - daysBackToWaveStart);

        // Форматируем дату начала волны
        const startYear = waveStartDate.getFullYear();
        const startMonth = String(waveStartDate.getMonth() + 1).padStart(2, '0');
        const startDay = String(waveStartDate.getDate()).padStart(2, '0');
        const startDateStr = `${startYear}-${startMonth}-${startDay}`;

        const wave = {
          offset,
          startDate: startDateStr,
          days: []
        };

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
            date: dateStr,
            data: waveData[dateStr] || null,
            tone: kinData.tone,
            seal: kinData.seal,
            personalDay: calculatePersonalDay(dateStr)
          });
        }

        waves.push(wave);
      }

      return waves;
    } catch (e) {
      console.error('Error in getWaves:', e);
      return [];
    }
  };

  const waves = getWaves();

  return (
    <div className="min-h-screen text-white p-4 pb-32 fade-in">

      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold tracking-wide text-white">История волн</div>
            <div className="mt-1 text-sm text-white/50 font-light">Выберите волну, чтобы открыть детали</div>
          </div>
          <div className="text-white/70">
            {window.LucideReact?.Layers ? (
              <window.LucideReact.Layers size={26} strokeWidth={2} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-3 pb-24">
        {waves.map((wave, index) => {
          const completedDays = wave.days.filter(d => d.data?.energy).length;
          const energyScore = (val) => {
            if (typeof val === 'number') return val;
            const map = { 'Апатия': 1, 'Низкая': 1, 'Спад': 2, 'Средняя': 3, 'Подъём': 4, 'Высокая': 5 };
            return map[val] || 0;
          };
          const avgEnergy = wave.days.reduce((sum, d) => sum + (d.data?.energy ? energyScore(d.data.energy) : 0), 0) / completedDays || 0;
          const peakDay = wave.days.reduce((max, d, idx) =>
            (d.data?.energy ? energyScore(d.data.energy) : 0) > (wave.days[max]?.data?.energy ? energyScore(wave.days[max].data.energy) : 0) ? idx : max, 0
          );

          return (
            <button
              key={wave.offset}
              onClick={() => {
                window.tgHapticLight?.();
                setCurrentWaveOffset(wave.offset);
                setCurrentScreen('wave');
              }}
              className="w-full rounded-3xl border bg-white/5 p-5 text-left backdrop-blur-xl transition duration-300 hover:bg-white/10 active:scale-[0.98]"
              style={{
                borderColor: hexToRgba(accent, wave.offset === 0 ? 0.35 : 0.14),
                backgroundImage: wave.offset === 0
                  ? `radial-gradient(900px circle at 90% 0%, ${hexToRgba(accent, 0.18)}, transparent 55%)`
                  : `radial-gradient(700px circle at 10% 0%, ${hexToRgba(accent, 0.10)}, transparent 60%)`
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-semibold">Волна {Math.abs(wave.offset) + 1}</div>
                  <div className="mt-1 inline-flex items-center gap-2 text-sm text-white/60">
                    {window.LucideReact?.Calendar ? (
                      <window.LucideReact.Calendar size={16} strokeWidth={1.5} />
                    ) : null}
                    {wave.startDate}
                  </div>
                </div>

                <div
                  className="shrink-0 rounded-full px-3 py-1 text-xs border"
                  style={wave.offset === 0 ? {
                    backgroundColor: hexToRgba(accent, 0.14),
                    borderColor: hexToRgba(accent, 0.35),
                    color: 'rgba(255,255,255,0.92)'
                  } : {
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.65)'
                  }}
                >
                  {wave.offset === 0 ? 'Текущая' : 'Прошлая'}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80">
                  <div className="inline-flex items-center gap-2 text-white/60">
                    {window.LucideReact?.CheckCircle2 ? (
                      <window.LucideReact.CheckCircle2 size={16} strokeWidth={1.5} />
                    ) : null}
                    Заполнено
                  </div>
                  <div className="mt-1 text-white font-semibold">{completedDays}/13</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80">
                  <div className="inline-flex items-center gap-2 text-white/60">
                    {window.LucideReact?.Zap ? (
                      <window.LucideReact.Zap size={16} strokeWidth={1.5} />
                    ) : null}
                    Средняя энергия
                  </div>
                  <div className="mt-1 text-white font-semibold">{avgEnergy.toFixed(1)}/5</div>
                </div>

                {completedDays > 0 && (
                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80">
                    <div className="inline-flex items-center gap-2 text-white/60">
                      {window.LucideReact?.Flame ? (
                        <window.LucideReact.Flame size={16} strokeWidth={1.5} />
                      ) : null}
                      Пик
                    </div>
                    <div className="mt-1 text-white font-semibold">День {peakDay + 1}</div>
                  </div>
                )}

                {userProfile && userProfile.birthDate && wave.days[0].personalDay && (
                  <div className="col-span-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-white/80">
                    <div className="inline-flex items-center gap-2 text-amber-400/80">
                      {window.LucideReact?.Hash ? (
                        <window.LucideReact.Hash size={16} strokeWidth={1.5} />
                      ) : null}
                      Личные дни (Сюцай)
                    </div>
                    <div className="mt-1 text-amber-300 font-semibold text-xs">
                      {wave.days.map((d, idx) => d.personalDay).filter(p => p).join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};