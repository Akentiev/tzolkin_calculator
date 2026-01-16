const { useState } = React;

const HomeScreen = ({ selectedDate, todayKin, seals, tones, questions, waveData, todayAnswers, setTodayAnswers, saveAnswers, analyzeDayWithClaude, dayAdvice, loadingDay, savingDay, setCurrentScreen }) => {
  const [showDetails, setShowDetails] = useState(false);
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

  const accent = seal?.color || '#F3F4F6';

  const { Calendar, ChevronDown, ChevronUp } = window.LucideReact || {};
  const todayLabel = new Date((selectedDate || '') + 'T00:00:00').toLocaleDateString('ru-RU', {
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

              <button
                type="button"
                onClick={() => {
                  window.tgHapticLight?.();
                  setCurrentScreen?.('fullCalendar');
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl transition duration-300 hover:bg-white/10 active:scale-[0.98]"
                title="Открыть калькулятор"
              >
                {Calendar ? <Calendar size={20} strokeWidth={1.5} className="text-white/70" /> : <span className="text-white/70">📅</span>}
                <div className="text-xs leading-tight">
                  <div className="text-white/80">{todayLabel}</div>
                  <div className="text-white/60">Кин {todayKin.kin}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Сегодня */}
      <div
        className="w-full mb-6 rounded-3xl border bg-white/5 p-5 backdrop-blur-xl"
        style={{
          borderColor: hexToRgba(accent, 0.28),
          backgroundImage: `radial-gradient(800px circle at 10% 0%, ${hexToRgba(accent, 0.18)}, transparent 55%)`
        }}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-xs text-white/60">Сегодня</div>
            <div className="mt-1 text-4xl font-semibold tracking-tight" style={{ color: seal.color }}>
              {todayKin.tone} {seal.name}
            </div>
            <div className="mt-2 text-sm text-white/70">{seal.essence}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl border bg-white/5 p-4"
              style={{
                borderColor: hexToRgba(accent, 0.2),
                backgroundImage: `radial-gradient(600px circle at 0% 0%, ${hexToRgba(accent, 0.12)}, transparent 60%)`
              }}
            >
              <div className="text-xs text-white/60">Тон</div>
              <div className="mt-1 text-sm font-semibold text-white">{tone.n} • {tone.name}</div>
              <div className="mt-1 text-xs text-white/60">{tone.essence}</div>
            </div>
            <div
              className="rounded-2xl border bg-white/5 p-4"
              style={{
                borderColor: hexToRgba(accent, 0.2),
                backgroundImage: `radial-gradient(600px circle at 100% 0%, ${hexToRgba(accent, 0.10)}, transparent 60%)`
              }}
            >
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
      <div
        className="w-full mb-6 rounded-3xl border bg-white/5 p-5 backdrop-blur-xl"
        style={{
          borderColor: hexToRgba(accent, 0.18),
          backgroundImage: `radial-gradient(900px circle at 90% 0%, ${hexToRgba(accent, 0.12)}, transparent 55%)`
        }}
      >
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
                  className={`min-h-[50px] rounded-2xl border px-3 py-3 text-sm font-medium transition duration-300 active:scale-[0.98] ${todayAnswers[key] === opt
                    ? 'text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                    }`}
                  style={todayAnswers[key] === opt ? {
                    backgroundImage: `linear-gradient(135deg, ${hexToRgba(accent, 0.30)}, ${hexToRgba(accent, 0.14)})`,
                    borderColor: hexToRgba(accent, 0.55),
                    boxShadow: `0 18px 40px ${hexToRgba(accent, 0.14)}`
                  } : undefined}
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
            if (!savingDay) {
              window.tgHapticLight?.();
              saveAnswers();
            }
          }}
          disabled={savingDay || !todayAnswers.energy}
          className="mt-4 w-full min-h-[50px] rounded-3xl px-4 py-4 text-sm font-semibold text-white transition duration-300 hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            backgroundImage: `linear-gradient(135deg, ${hexToRgba(accent, 0.95)}, ${hexToRgba(accent, 0.55)})`,
            boxShadow: `0 18px 45px ${hexToRgba(accent, 0.18)}`
          }}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {savingDay ? (
              window.LucideReact?.Loader2 ? (
                <window.LucideReact.Loader2 size={20} strokeWidth={1.5} className="animate-spin" />
              ) : '⏳'
            ) : (
              window.LucideReact?.Save ? <window.LucideReact.Save size={20} strokeWidth={1.5} /> : null
            )}
            {savingDay ? 'ИИ обрабатывает данные...' : 'Сохранить день'}
          </span>
        </button>

        {/* Анализ дня AI */}
        <div className="mt-6">
          <button
            onClick={() => {
              window.tgHapticLight?.();
              analyzeDayWithClaude();
            }}
            disabled={!todayAnswers.energy || loadingDay || savingDay}
            className="w-full min-h-[50px] appearance-none rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4 text-sm font-semibold text-white/90 transition duration-300 hover:bg-white/10 disabled:opacity-60 disabled:bg-slate-950/60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {loadingDay ? (
                window.LucideReact?.Loader2 ? (
                  <window.LucideReact.Loader2 size={20} strokeWidth={1.5} className="animate-spin" />
                ) : '⏳'
              ) : (
                window.LucideReact?.Bot ? <window.LucideReact.Bot size={20} strokeWidth={1.5} /> : null
              )}
              {loadingDay ? 'ИИ обрабатывает данные...' : 'ИИ-совет на сегодня'}
            </span>
          </button>

          {dayAdvice && (
            <div className="mt-3 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-gray-200">
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
