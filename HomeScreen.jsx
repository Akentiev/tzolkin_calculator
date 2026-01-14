const { useState } = React;

const HomeScreen = ({ todayKin, seals, tones, questions, waveData, todayAnswers, setTodayAnswers, saveAnswers, analyzeDayWithClaude, dayAdvice, loadingDay, setCurrentScreen }) => {
  const [showDetails, setShowDetails] = useState(false);
  const seal = seals[todayKin.seal];
  const tone = tones[todayKin.tone - 1];

  const { Calendar, ChevronDown, ChevronUp } = window.LucideReact || {};
  const todayLabel = new Date().toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: '2-digit',
    month: 'long'
  });

  const renderMarkdown = (markdown) => {
    if (!markdown) return { __html: '' };

    const stripLeadingEmojiFromHeadings = (text) => {
      // Remove emoji/pictographs right after Markdown heading markers to avoid “old emoji icons” in AI output.
      // Example: "### 📊 Title" -> "### Title"
      try {
        return String(text)
          .replace(
            /^(\s{0,3}#{1,6}\s*)(?:[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}]\uFE0F?\s*)+/gmu,
            '$1'
          );
      } catch (_) {
        return String(text);
      }
    };

    const cleaned = stripLeadingEmojiFromHeadings(markdown);

    try {
      if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        return { __html: DOMPurify.sanitize(marked.parse(cleaned)) };
      }
    } catch (_) {
      // fall through to plain text
    }

    const escaped = String(cleaned)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return { __html: escaped.replace(/\n/g, '<br/>') };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 pt-4 pb-24">

      {/* Header */}
      <div className="w-full mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Tzolk'in Tracker</div>
            <div className="text-sm text-white/60">Дневник паттернов энергии</div>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.tgHapticLight?.();
                  setCurrentScreen?.('tutorial');
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 backdrop-blur-xl transition duration-300 hover:bg-white/10 active:scale-[0.98]"
                title="Обучение"
                type="button"
              >
                {window.LucideReact?.Info ? (
                  <window.LucideReact.Info size={18} strokeWidth={1.5} />
                ) : (
                  <span>ℹ️</span>
                )}
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl">
                {Calendar ? <Calendar size={20} strokeWidth={1.5} className="text-white/70" /> : <span className="text-white/70">📅</span>}
                <div className="text-xs leading-tight">
                  <div className="text-white/80">{todayLabel}</div>
                  <div className="text-white/60">Кин {todayKin.kin}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Сегодня */}
      <div className="w-full mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-xs text-white/60">Сегодня</div>
            <div className="mt-1 text-4xl font-semibold tracking-tight" style={{ color: seal.color }}>
              {todayKin.tone} {seal.name}
            </div>
            <div className="mt-2 text-sm text-white/70">{seal.essence}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60">Тон</div>
              <div className="mt-1 text-sm font-semibold text-white">{tone.n} • {tone.name}</div>
              <div className="mt-1 text-xs text-white/60">{tone.essence}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-blue-500/5 p-4">
              <div className="text-xs text-white/60">Фаза</div>
              <div className="mt-1 text-sm font-semibold text-white">{tone.phase}</div>
              <div className="mt-1 text-xs text-white/60">{tone.action}</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            window.tgHapticLight?.();
            setShowDetails(!showDetails);
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition duration-300 active:scale-[0.98]"
        >
          {showDetails
            ? (ChevronUp ? <ChevronUp size={20} strokeWidth={1.5} className="text-white/70" /> : '▲')
            : (ChevronDown ? <ChevronDown size={20} strokeWidth={1.5} className="text-white/70" /> : '▼')}
          <span>{showDetails ? 'Скрыть детали' : 'Показать детали'}</span>
        </button>

        {showDetails && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-white/60">Стихия</div>
                <div className="mt-1 text-sm text-white">{seal.element}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Действие дня</div>
                <div className="mt-1 text-sm text-white">{tone.action}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/55">
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
      <div className="w-full mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-white">Отследить день</div>
          <div className="text-xs text-white/50">5 вопросов + заметка</div>
        </div>

        {Object.entries(questions).map(([key, { q, options }]) => (
          <div key={key} className="mt-4">
            <div className="text-sm text-white/70 mb-2">{q}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    window.tgHapticLight?.();
                    setTodayAnswers({ ...todayAnswers, [key]: opt });
                  }}
                  className={`min-h-[50px] rounded-2xl px-3 py-3 text-sm font-medium transition duration-300 active:scale-[0.98] ${todayAnswers[key] === opt
                    ? 'bg-gradient-to-r from-indigo-500/45 to-purple-600/45 text-white ring-1 ring-indigo-200/50 border border-indigo-300/50 shadow-lg shadow-indigo-500/15'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-5">
          <div className="text-sm text-white/70 mb-2">Заметки (необязательно)</div>
          <textarea
            value={todayAnswers.notes}
            onChange={(e) => setTodayAnswers({ ...todayAnswers, notes: e.target.value })}
            className="w-full rounded-2xl bg-white/5 px-4 py-4 text-sm text-white/90 placeholder:text-white/40 outline-none transition duration-300 focus:bg-white/10"
            rows="3"
            placeholder="Ключевые события дня..."
          />
        </div>

        <button
          onClick={() => {
            window.tgHapticLight?.();
            saveAnswers();
          }}
          className="mt-4 w-full min-h-[50px] rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-300 hover:opacity-95 active:scale-[0.98]"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {(window.LucideReact?.Save ? <window.LucideReact.Save size={20} strokeWidth={1.5} /> : null)}
            Сохранить день
          </span>
        </button>

        {/* Анализ дня AI */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
          <div className="mb-3 text-sm font-semibold">
            <span className="bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">AI анализ</span>
          </div>

          <button
            onClick={() => {
              window.tgHapticLight?.();
              analyzeDayWithClaude();
            }}
            disabled={!todayAnswers.energy || loadingDay}
            className="w-full min-h-[50px] appearance-none rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4 text-sm font-semibold text-white/90 transition duration-300 hover:bg-white/10 disabled:opacity-60 disabled:bg-slate-950/60 active:scale-[0.98]"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {(window.LucideReact?.Bot ? <window.LucideReact.Bot size={20} strokeWidth={1.5} /> : null)}
              {loadingDay ? 'Анализирую...' : 'Совет AI на сегодня'}
            </span>
          </button>

          {dayAdvice && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-gray-200">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={renderMarkdown(dayAdvice)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-full mt-6 text-center text-xs text-white/50">
        Заполняйте каждый день. Через 13 дней вы увидите свой паттерн.
      </div>
    </div>
  );
};
