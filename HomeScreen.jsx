const { useState } = React;

const HomeScreen = ({ selectedDate, todayKin, seals, tones, questions, waveData, todayAnswers, setTodayAnswers, saveAnswers, analyzeDayWithClaude, dayAdvice, loadingDay, savingDay, setCurrentScreen }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showNotesInfo, setShowNotesInfo] = useState(false);
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
    <div className="min-h-screen text-white px-4 pt-4 pb-32 fade-in">

      {/* Header */}
      <div className="w-full mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-bold tracking-wide">Tzolk'in Tracker</div>
            <div className="text-sm text-white/50 font-light mt-1">Дневник паттернов энергии</div>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.tgHapticLight?.();
                  setCurrentScreen?.('tutorial');
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl glass-card text-cyan-400/80 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}
                title="Обучение"
                type="button"
              >
                {window.LucideReact?.Info ? (
                  <window.LucideReact.Info size={20} strokeWidth={2} />
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
                className="inline-flex items-center gap-2 rounded-full glass-card px-3 py-2 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}
                title="Открыть калькулятор"
              >
                {Calendar ? <Calendar size={20} strokeWidth={2} className="text-white/70" /> : <span className="text-white/70">📅</span>}
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
        className="w-full mb-6 rounded-3xl glass-card-strong p-6"
        style={{
          borderColor: hexToRgba(accent, 0.35),
          backgroundImage: `radial-gradient(800px circle at 10% 0%, ${hexToRgba(accent, 0.22)}, transparent 60%)`,
          boxShadow: `0 0 30px ${hexToRgba(accent, 0.20)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
        }}
      >
        <div className="grid grid-cols-1 gap-5">
          <div>
            <div className="text-xs text-white/50 font-medium tracking-wider uppercase">Сегодня</div>
            <div className="mt-2 text-4xl font-bold tracking-tight" style={{ color: seal.color }}>
              {todayKin.tone} {seal.name}
            </div>
            <div className="mt-2 text-sm text-white/70 font-light">{seal.essence}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl glass-card p-4"
              style={{
                borderColor: hexToRgba(accent, 0.25),
                backgroundImage: `radial-gradient(600px circle at 0% 0%, ${hexToRgba(accent, 0.15)}, transparent 70%)`,
                boxShadow: `0 0 15px ${hexToRgba(accent, 0.1)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
              }}
            >
              <div className="text-xs text-white/50 font-medium">Тон</div>
              <div className="mt-1.5 text-sm font-bold text-white">{tone.n} • {tone.name}</div>
              <div className="mt-1 text-xs text-white/60 font-light">{tone.essence}</div>
            </div>
            <div
              className="rounded-2xl glass-card p-4"
              style={{
                borderColor: hexToRgba(accent, 0.25),
                backgroundImage: `radial-gradient(600px circle at 100% 0%, ${hexToRgba(accent, 0.15)}, transparent 70%)`,
                boxShadow: `0 0 15px ${hexToRgba(accent, 0.1)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
              }}
            >
              <div className="text-xs text-white/50 font-medium">Фаза</div>
              <div className="mt-1.5 text-sm font-bold text-white">{tone.phase}</div>
              <div className="mt-1 text-xs text-white/60 font-light">{tone.action}</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            window.tgHapticLight?.();
            setShowDetails(!showDetails);
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl glass-card px-4 py-3 text-sm text-white/80 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          {showDetails
            ? (ChevronUp ? <ChevronUp size={20} strokeWidth={2} className="text-white/70" /> : '▲')
            : (ChevronDown ? <ChevronDown size={20} strokeWidth={2} className="text-white/70" /> : '▼')}
          <span>{showDetails ? 'Скрыть детали' : 'Показать детали'}</span>
        </button>

        {showDetails && (
          <div
            className="mt-4 rounded-2xl glass-card p-4 text-sm text-white/70 fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 10, 18, 0.85), rgba(6, 12, 22, 0.78))',
              border: `1.5px solid ${hexToRgba(accent, 0.28)}`,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-white/50 font-medium">Стихия</div>
                <div className="mt-1 text-sm text-white">{seal.element}</div>
              </div>
              <div>
                <div className="text-xs text-white/50 font-medium">Действие дня</div>
                <div className="mt-1 text-sm text-white">{tone.action}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-white/55 font-light">
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
        className="w-full mb-6 rounded-3xl glass-card-strong p-6"
        style={{
          borderColor: hexToRgba(accent, 0.22),
          backgroundImage: `radial-gradient(900px circle at 90% 0%, ${hexToRgba(accent, 0.15)}, transparent 60%)`,
          boxShadow: `0 0 25px ${hexToRgba(accent, 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-bold text-white tracking-wide">Отследить день</div>
          <div className="text-xs text-white/40 font-light">5 вопросов + заметка</div>
        </div>

        {Object.entries(questions).map(([key, { q, options }]) => (
          <div key={key} className="mt-5">
            <div className="text-sm text-white/70 mb-3 font-medium">{q}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {options.map(opt => {
                const isActive = todayAnswers[key] === opt;

                const baseButtonStyle = {
                  border: '1.5px solid rgba(255, 255, 255, 0.14)',
                  background: 'rgba(8, 14, 24, 0.62)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  willChange: 'transform'
                };

                const activeButtonStyle = {
                  background: `linear-gradient(135deg, ${hexToRgba(accent, 0.38)}, ${hexToRgba(accent, 0.22)})`,
                  border: `1.5px solid ${hexToRgba(accent, 0.70)}`,
                  boxShadow: `0 0 18px ${hexToRgba(accent, 0.24)}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  willChange: 'transform'
                };

                return (
                  <button
                    key={opt}
                    onClick={() => {
                      window.tgHapticLight?.();
                      setTodayAnswers({ ...todayAnswers, [key]: opt });
                    }}
                    className={`min-h-[50px] rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300 active:scale-[0.95] glass-card ${isActive
                      ? 'text-white'
                      : 'text-white/80 hover:bg-white/5'
                      }`}
                    style={isActive ? activeButtonStyle : baseButtonStyle}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-white/70 font-medium">Заметки</div>
            <button
              onClick={() => {
                window.tgHapticLight?.();
                setShowNotesInfo(true);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl glass-card text-cyan-400/80 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }}
              title="О заметках"
              type="button"
            >
              {window.LucideReact?.Info ? (
                <window.LucideReact.Info size={16} strokeWidth={2} />
              ) : (
                <span>ℹ️</span>
              )}
            </button>
          </div>
          <textarea
            value={todayAnswers.notes}
            onChange={(e) => setTodayAnswers({ ...todayAnswers, notes: e.target.value })}
            className="w-full rounded-2xl glass-card px-4 py-4 text-sm text-white/90 placeholder:text-white/40 outline-none transition-all duration-300 focus:bg-white/10 focus:border-cyan-400/30"
            style={{
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
            rows="3"
            placeholder="Ключевые события дня..."
          />

          {/* Модальное окно о заметках */}
          {showNotesInfo && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)'
              }}
              onClick={() => setShowNotesInfo(false)}
            >
              <div 
                className="max-w-md w-full rounded-3xl glass-card-strong p-6"
                style={{
                  borderColor: 'rgba(34, 211, 238, 0.3)',
                  background: 'linear-gradient(135deg, rgba(6, 10, 18, 0.95), rgba(6, 12, 22, 0.92))',
                  boxShadow: '0 0 40px rgba(34, 211, 238, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-white">О заметках</div>
                  <button
                    onClick={() => {
                      window.tgHapticLight?.();
                      setShowNotesInfo(false);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl glass-card text-white/70 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                  >
                    {window.LucideReact?.X ? (
                      <window.LucideReact.X size={16} strokeWidth={2} />
                    ) : (
                      <span>✕</span>
                    )}
                  </button>
                </div>

                <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-cyan-400 mb-2">
                      {window.LucideReact?.BookOpen ? (
                        <window.LucideReact.BookOpen size={16} strokeWidth={2} />
                      ) : null}
                      Дневник записей
                    </div>
                    <p className="text-white/70">Ваши заметки формируют <strong>личный дневник</strong>, где вы можете отслеживать ключевые события и рефлексии каждого дня.</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 font-semibold text-purple-400 mb-2">
                      {window.LucideReact?.Waves ? (
                        <window.LucideReact.Waves size={16} strokeWidth={2} />
                      ) : null}
                      Дневник волн
                    </div>
                    <p className="text-white/70">Записи сохраняются в <strong>дневнике волн</strong>, что позволяет видеть динамику 13-дневных циклов и обнаруживать паттерны.</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 font-semibold text-amber-400 mb-2">
                      {window.LucideReact?.Bot ? (
                        <window.LucideReact.Bot size={16} strokeWidth={2} />
                      ) : null}
                      ИИ-рекомендации
                    </div>
                    <p className="text-white/70">На основе ваших заметок ИИ создаёт <strong>персональные рекомендации</strong>, учитывая контекст вашей жизни и энергетику дня.</p>
                  </div>

                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-3 mt-3">
                    <p className="text-white/70 text-xs">💡 Чем подробнее заметка, тем точнее анализ ИИ и полезнее рекомендации.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (!savingDay) {
              window.tgHapticLight?.();
              saveAnswers();
            }
          }}
          disabled={savingDay || !todayAnswers.energy}
          className="mt-5 w-full min-h-[56px] rounded-3xl px-4 py-4 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] pulse-glow"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(accent, 1)}, ${hexToRgba(accent, 0.70)})`,
            boxShadow: `0 0 30px ${hexToRgba(accent, 0.35)}, 0 4px 20px rgba(0, 0, 0, 0.3)`
          }}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {savingDay ? (
              window.LucideReact?.Loader2 ? (
                <window.LucideReact.Loader2 size={22} strokeWidth={2} className="animate-spin" />
              ) : '⏳'
            ) : (
              window.LucideReact?.Save ? <window.LucideReact.Save size={22} strokeWidth={2} /> : null
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
            className="w-full min-h-[56px] rounded-3xl glass-card px-4 py-4 text-sm font-bold text-white/90 transition-all duration-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.95]"
            style={{
              background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(168, 85, 247, 0.10))',
              borderColor: 'rgba(217, 70, 239, 0.3)',
              boxShadow: '0 0 20px rgba(217, 70, 239, 0.15), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {loadingDay ? (
                window.LucideReact?.Loader2 ? (
                  <window.LucideReact.Loader2 size={22} strokeWidth={2} className="animate-spin" />
                ) : '⏳'
              ) : (
                window.LucideReact?.Bot ? <window.LucideReact.Bot size={22} strokeWidth={2} /> : null
              )}
              {loadingDay ? 'ИИ обрабатывает данные...' : 'ИИ-совет на сегодня'}
            </span>
          </button>

          {dayAdvice && (
            <div
              className="mt-4 rounded-3xl glass-card-strong p-5 text-gray-200 fade-in"
              style={{
                background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.08), rgba(168, 85, 247, 0.05))',
                borderColor: 'rgba(217, 70, 239, 0.25)',
                boxShadow: '0 0 20px rgba(217, 70, 239, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              }}
            >
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={renderMarkdown(dayAdvice)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-full mt-6 text-center text-xs text-white/40 font-light">
        Заполняйте каждый день. Через 13 дней вы увидите свой паттерн.
      </div>
    </div>
  );
};
