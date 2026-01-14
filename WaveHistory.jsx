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
        <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <button
            onClick={() => {
              window.tgHapticLight?.();
              setShowAnalysis(!showAnalysis);
            }}
            className="w-full min-h-[50px] rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-semibold text-white/90 transition duration-300 hover:bg-white/10 active:scale-[0.98]"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                {(window.LucideReact?.BarChart3 ? (
                  <window.LucideReact.BarChart3 size={20} strokeWidth={1.5} />
                ) : null)}
                Анализ паттерна
              </span>
              <span className="text-white/60">
                {showAnalysis ? (
                  window.LucideReact?.ChevronUp ? (
                    <window.LucideReact.ChevronUp size={18} strokeWidth={1.5} />
                  ) : (
                    '▲'
                  )
                ) : window.LucideReact?.ChevronDown ? (
                  <window.LucideReact.ChevronDown size={18} strokeWidth={1.5} />
                ) : (
                  '▼'
                )}
              </span>
            </span>
          </button>

          {showAnalysis && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 whitespace-pre-line">
              {analyzePattern()}
            </div>
          )}

          <button
            onClick={() => {
              window.tgHapticLight?.();
              analyzeWaveWithClaude();
            }}
            disabled={Object.keys(waveData).length < 13 || loadingWave}
            className="mt-4 w-full min-h-[50px] rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-300 hover:opacity-95 disabled:opacity-40 active:scale-[0.98]"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {(window.LucideReact?.Sparkles ? (
                <window.LucideReact.Sparkles size={20} strokeWidth={1.5} />
              ) : null)}
              {loadingWave ? 'Анализирую волну...' : 'Анализ волны от AI'}
            </span>
          </button>

          {waveAnalysis && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-200">
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