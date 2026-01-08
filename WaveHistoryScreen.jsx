const WaveHistoryScreen = ({ waveData, setShowWaveHistory, setCurrentWaveOffset, setCurrentScreen }) => {
  const [view, setView] = useState('current');
  const currentDate = new Date().toISOString().split('T')[0];

  // Получить список всех волн
  const getWaves = () => {
    try {
      const waves = [];
      const today = new Date();
      
      // Начинаем с текущей волны (offset 0) и идем назад
      for (let offset = 0; offset >= -10; offset--) { // Показываем последние 10 волн
        const totalDaysBack = 12 + (Math.max(0, -offset) * 13);
        const waveStartDate = new Date(today);
        waveStartDate.setDate(waveStartDate.getDate() - totalDaysBack);
        
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
          
          wave.days.push({
            date: dateStr,
            data: waveData[dateStr] || null
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 pb-20">
      
      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <h1 className="text-3xl font-bold text-purple-300">📊 История волн</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-3 pb-20">
        {waves.map((wave, index) => {
          const completedDays = wave.days.filter(d => d.data?.energy).length;
          const avgEnergy = wave.days.reduce((sum, d) => sum + (d.data?.energy ? { 'Низкая': 1, 'Спад': 2, 'Средняя': 3, 'Подъём': 4, 'Высокая': 5 }[d.data.energy] || 0 : 0), 0) / completedDays || 0;
          const peakDay = wave.days.reduce((max, d, idx) => 
            (d.data?.energy ? { 'Низкая': 1, 'Спад': 2, 'Средняя': 3, 'Подъём': 4, 'Высокая': 5 }[d.data.energy] || 0 : 0) > (wave.days[max]?.data?.energy ? { 'Низкая': 1, 'Спад': 2, 'Средняя': 3, 'Подъём': 4, 'Высокая': 5 }[wave.days[max].data.energy] || 0 : 0) ? idx : max, 0
          );
          
          return (
            <button
              key={wave.offset}
              onClick={() => {
                setCurrentWaveOffset(wave.offset);
                setCurrentScreen('wave');
              }}
              className="w-full bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition text-left"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-white font-semibold">Волна {Math.abs(wave.offset) + 1}</div>
                  <div className="text-gray-400 text-sm">{wave.startDate}</div>
                </div>
                <div className={`px-3 py-1 rounded text-xs ${
                  wave.offset === 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                }`}>
                  {wave.offset === 0 ? 'Текущая' : 'Прошлая'}
                </div>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>📊 Заполнено дней: {completedDays}/13</div>
                <div>⚡ Средняя энергия: {avgEnergy.toFixed(1)}/5</div>
                {completedDays > 0 && <div>🔥 Пик: День {peakDay + 1}</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};