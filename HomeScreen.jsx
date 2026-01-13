const { useState } = React;

const HomeScreen = ({ todayKin, seals, tones, questions, waveData, todayAnswers, setTodayAnswers, saveAnswers, analyzeDayWithClaude, dayAdvice, loadingDay, setCurrentScreen }) => {
  const [showDetails, setShowDetails] = useState(false);
  const seal = seals[todayKin.seal];
  const tone = tones[todayKin.tone - 1];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 pb-20">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="text-3xl font-bold mb-2">🌀 Tzolk'in Tracker</div>
        <div className="text-gray-400">Дневник паттернов энергии</div>
      </div>

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
          onClick={() => {
            window.tgHapticLight?.();
            setShowDetails(!showDetails);
          }}
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

      {/* Отследить день */}
      <div className="max-w-2xl mx-auto mb-6 p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30">
        <div className="text-xl font-bold mb-4 text-purple-300">📝 Отследить день</div>

        {Object.entries(questions).map(([key, { q, options }]) => (
          <div key={key} className="mb-4">
            <div className="text-sm text-gray-400 mb-2">{q}</div>
            <div className="grid grid-cols-3 gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    window.tgHapticLight?.();
                    setTodayAnswers({ ...todayAnswers, [key]: opt });
                  }}
                  className={`p-2 rounded-lg text-sm font-medium transition ${todayAnswers[key] === opt
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
          onClick={() => {
            window.tgHapticLight?.();
            saveAnswers();
          }}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          💾 Сохранить день
        </button>

        {/* Анализ дня AI */}
        <div className="mt-6 p-4 bg-blue-900/30 rounded-xl border border-blue-500/30">
          <button
            onClick={() => {
              window.tgHapticLight?.();
              analyzeDayWithClaude();
            }}
            disabled={!todayAnswers.energy || loadingDay}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg mb-3"
          >
            {loadingDay ? '⏳ Анализирую...' : '🤖 Совет AI на сегодня'}
          </button>

          {dayAdvice && (
            <div className="p-4 bg-blue-500/20 rounded-lg text-gray-200">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={renderMarkdown(dayAdvice)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 text-center text-xs text-gray-500">
        Заполняйте каждый день. Через 13 дней вы увидите свой паттерн.
      </div>
    </div>
  );
};
