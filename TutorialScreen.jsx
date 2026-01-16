const TutorialScreen = ({ seals, tones, setShowTutorial }) => {
  return (
    <div className="min-h-screen text-white p-4 pb-32 fade-in">

      {/* Заголовок */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="rounded-3xl glass-card-strong p-6" style={{
          borderColor: 'rgba(6, 182, 212, 0.25)',
          backgroundImage: 'radial-gradient(900px circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 60%)',
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-wide text-white">Обучение Tzolk'in</h1>
            <div className="text-cyan-400/80">
              {window.LucideReact?.BookOpen ? (
                <window.LucideReact.BookOpen size={24} strokeWidth={2} />
              ) : null}
            </div>
          </div>
          <div className="mt-1.5 text-sm text-white/50 font-light">Коротко о печатях, тонах и практике</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 pb-6">

        {/* Введение */}
        <div className="rounded-3xl glass-card-strong p-6" style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <h2 className="text-base font-bold text-white mb-3 tracking-wide">Что такое Tzolk'in?</h2>
          <p className="text-white/80 mb-3 text-sm font-light leading-relaxed">
            Tzolk'in (Цолькин) - это священный календарь майя, основанный на 260-дневном цикле.
            Он состоит из 20 печатей (солнечных знаков) и 13 тонов (волновых гармоник).
          </p>
          <p className="text-white/80 text-sm font-light leading-relaxed">
            Каждый день имеет уникальную комбинацию тона и печати, которая определяет энергию,
            возможности и уроки этого дня.
          </p>
        </div>

        {/* Печати */}
        <div className="rounded-3xl glass-card-strong p-6" style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <h2 className="text-base font-bold text-white mb-4 tracking-wide">20 Печатей</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {seals.map((seal, index) => (
              <div key={index} className="rounded-2xl glass-card p-3 hover:bg-white/8 transition-all duration-300" style={{
                boxShadow: `0 2px 10px ${seal.color}15, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
              }}>
                <div className="font-bold" style={{ color: seal.color }}>{seal.name}</div>
                <div className="text-white/70 text-xs mt-1 font-light">{seal.essence}</div>
                <div className="text-white/50 text-xs mt-0.5">{seal.element}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Тоны */}
        <div className="rounded-3xl glass-card-strong p-6" style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <h2 className="text-base font-bold text-white mb-4 tracking-wide">13 Тонов</h2>
          <div className="space-y-2 text-sm">
            {tones.map((tone) => (
              <div key={tone.n} className="rounded-2xl glass-card p-3 hover:bg-white/8 transition-all duration-300" style={{
                boxShadow: '0 2px 10px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Тон {tone.n} • {tone.name}</span>
                  <span className="text-cyan-400/70 text-xs font-medium px-2 py-1 rounded-lg glass-card">{tone.phase}</span>
                </div>
                <div className="text-white/70 text-xs mt-1.5 font-light">{tone.essence}</div>
                <div className="text-white/50 text-xs mt-1 font-light">{tone.action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Как пользоваться приложением */}
        <div className="rounded-3xl glass-card-strong p-6" style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <h2 className="text-base font-bold text-white mb-4 tracking-wide">Как пользоваться приложением</h2>
          <div className="space-y-4 text-sm text-white/80">
            <div>
              <h3 className="font-bold text-white mb-2">1. Ежедневное отслеживание</h3>
              <p className="font-light leading-relaxed">Каждый день отвечайте на 5 вопросов о своей энергии, резонансе с печатью, активности, проектах и ключевых событиях.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">2. Анализ паттерна</h3>
              <p className="font-light leading-relaxed">Через несколько дней приложение покажет ваш личный паттерн - в какие тоны у вас высокая энергия, а в какие низкая.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">3. AI советы</h3>
              <p className="font-light leading-relaxed">Получайте персонализированные рекомендации на основе энергии дня и ваших ответов.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">4. Анализ полной волны</h3>
              <p className="font-light leading-relaxed">После заполнения 13 дней получите глубокий анализ вашей волны от ИИ.</p>
            </div>
          </div>
        </div>

        {/* Советы */}
        <div className="rounded-3xl glass-card-strong p-6" style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <h2 className="text-base font-bold text-white mb-4 tracking-wide">Полезные советы</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="font-light leading-relaxed">• Отвечайте честно - это поможет увидеть реальный паттерн</li>
            <li className="font-light leading-relaxed">• Заполняйте каждый день для точного анализа</li>
            <li className="font-light leading-relaxed">• Читайте описания тонов и печатей для лучшего понимания</li>
            <li className="font-light leading-relaxed">• Используйте заметки для ключевых событий дня</li>
            <li className="font-light leading-relaxed">• Через 13 дней вы увидите полную картину своей волны</li>
          </ul>
        </div>

      </div>
    </div>
  );
};