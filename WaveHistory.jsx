const WaveHistory = ({ waveData, showAnalysis, setShowAnalysis, analyzeWaveWithClaude, waveAnalysis, loadingWave }) => {
  const renderMarkdown = (markdown) => {
    if (!markdown) return { __html: '' };

    try {
      if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        return { __html: DOMPurify.sanitize(marked.parse(markdown)) };
      }
    } catch (_) {
      // fall through to plain text
    }

    const escaped = String(markdown)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return { __html: escaped.replace(/\n/g, '<br/>') };
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

  return (
    <div>
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
            <div className="mt-4 p-4 bg-purple-500/20 rounded-lg text-gray-200">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={renderMarkdown(waveAnalysis)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};