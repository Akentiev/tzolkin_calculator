const WaveVisualization = ({ waveData, setShowWave }) => {
  const currentDate = new Date().toISOString().split('T')[0];

  // Получаем данные за последние 13 дней
  const getLast13Days = () => {
    const days = [];
    for (let i = 12; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        data: waveData[dateStr] || null,
        dayNumber: 13 - i
      });
    }
    return days;
  };

  const waveDays = getLast13Days();
  const energyData = waveDays.map(d => d.data?.energy ? ['Низкая', 'Спад', 'Средняя', 'Подъём', 'Высокая'].indexOf(d.data.energy) + 1 : 0);

  const maxEnergy = 5;
  const points = energyData.map((e, i) => {
    const x = (i / 12) * 100;
    const y = 100 - (e / maxEnergy) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">

      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <h1 className="text-3xl font-bold text-purple-300">🌀 Волна энергии</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 pb-20">

        {/* График волны */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6">
          <h2 className="text-xl font-bold text-purple-300 mb-4">График энергии за 13 дней</h2>

          <div className="w-full h-64 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-4 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#EC4899" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Сетка */}
              {[0, 25, 50, 75, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#374151" strokeWidth="0.2" />
              ))}

              {/* Линии дней */}
              {waveDays.map((_, i) => (
                <line key={i} x1={(i / 12) * 100} y1="0" x2={(i / 12) * 100} y2="100" stroke="#374151" strokeWidth="0.1" />
              ))}

              {/* Волновая линия */}
              <polyline
                points={points}
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Точки данных */}
              {energyData.map((e, i) => {
                if (e === 0) return null;
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

              {/* Метки дней */}
              {waveDays.map((day, i) => {
                const x = (i / 12) * 100;
                const isToday = day.date === currentDate;
                return (
                  <text
                    key={i}
                    x={x}
                    y="95"
                    fontSize="2.5"
                    fill={isToday ? "#F59E0B" : "#9CA3AF"}
                    textAnchor="middle"
                    fontWeight={isToday ? "bold" : "normal"}
                  >
                    {day.dayNumber}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Легенда */}
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Низкая</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Спад</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Средняя</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Подъём</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Высокая</span>
            </div>
          </div>
        </div>

        {/* Детали по дням */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Детали по дням</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waveDays.map((day, i) => (
              <div key={i} className={`p-4 rounded-lg border ${
                day.date === currentDate
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-gray-800/50 border-gray-700'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className={`text-sm font-semibold ${
                      day.date === currentDate ? 'text-purple-300' : 'text-gray-300'
                    }`}>
                      День {day.dayNumber}
                    </div>
                    <div className="text-xs text-gray-500">{day.date}</div>
                  </div>
                  {day.date === currentDate && (
                    <div className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      Сегодня
                    </div>
                  )}
                </div>

                {day.data ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Энергия:</span>
                      <span className={`font-medium ${
                        day.data.energy === 'Высокая' ? 'text-blue-400' :
                        day.data.energy === 'Подъём' ? 'text-green-400' :
                        day.data.energy === 'Средняя' ? 'text-yellow-400' :
                        day.data.energy === 'Спад' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {day.data.energy}
                      </span>
                    </div>
                    {day.data.notes && (
                      <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {day.data.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Нет данных
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Статистика волны</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {waveDays.filter(d => d.data?.energy === 'Высокая').length}
              </div>
              <div className="text-sm text-gray-400">Высоких дней</div>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {waveDays.filter(d => d.data?.energy === 'Подъём').length}
              </div>
              <div className="text-sm text-gray-400">Дней подъёма</div>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {waveDays.filter(d => d.data?.energy === 'Спад').length}
              </div>
              <div className="text-sm text-gray-400">Дней спада</div>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {waveDays.filter(d => d.data?.energy === 'Низкая').length}
              </div>
              <div className="text-sm text-gray-400">Низких дней</div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            Заполнено {waveDays.filter(d => d.data?.energy).length} из 13 дней
          </div>
        </div>

      </div>
    </div>
  );
};