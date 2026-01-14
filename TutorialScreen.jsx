const TutorialScreen = ({ seals, tones, setShowTutorial }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 pb-24">

      {/* Заголовок */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-white">Обучение Tzolk'in</h1>
            <div className="text-white/60">
              {window.LucideReact?.BookOpen ? (
                <window.LucideReact.BookOpen size={20} strokeWidth={1.5} />
              ) : null}
            </div>
          </div>
          <div className="mt-1 text-sm text-white/60">Коротко о печатях, тонах и практике</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 pb-24">

        {/* Введение */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h2 className="text-base font-semibold text-white mb-3">Что такое Tzolk'in?</h2>
          <p className="text-white/80 mb-3 text-sm">
            Tzolk'in (Цолькин) - это священный календарь майя, основанный на 260-дневном цикле.
            Он состоит из 20 печатей (солнечных знаков) и 13 тонов (волновых гармоник).
          </p>
          <p className="text-white/80 text-sm">
            Каждый день имеет уникальную комбинацию тона и печати, которая определяет энергию,
            возможности и уроки этого дня.
          </p>
        </div>

        {/* Печати */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h2 className="text-base font-semibold text-white mb-3">20 Печатей</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {seals.map((seal, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="font-medium" style={{ color: seal.color }}>{seal.name}</div>
                <div className="text-white/70 text-xs">{seal.essence}</div>
                <div className="text-white/50 text-xs">{seal.element}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Тоны */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h2 className="text-base font-semibold text-white mb-3">13 Тонов</h2>
          <div className="space-y-2 text-sm">
            {tones.map((tone) => (
              <div key={tone.n} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">Тон {tone.n} • {tone.name}</span>
                  <span className="text-white/60 text-xs">{tone.phase}</span>
                </div>
                <div className="text-white/70 text-xs mt-1">{tone.essence}</div>
                <div className="text-white/50 text-xs">{tone.action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Как пользоваться приложением */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h2 className="text-base font-semibold text-white mb-3">Как пользоваться приложением</h2>
          <div className="space-y-4 text-sm text-white/80">
            <div>
              <h3 className="font-medium text-white mb-2">1. Ежедневное отслеживание</h3>
              <p>Каждый день отвечайте на 5 вопросов о своей энергии, резонансе с печатью, активности, проектах и ключевых событиях.</p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">2. Анализ паттерна</h3>
              <p>Через несколько дней приложение покажет ваш личный паттерн - в какие тоны у вас высокая энергия, а в какие низкая.</p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">3. AI советы</h3>
              <p>Получайте персонализированные рекомендации на основе энергии дня и ваших ответов.</p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">4. Анализ полной волны</h3>
              <p>После заполнения 13 дней получите глубокий анализ вашей волны от ИИ.</p>
            </div>
          </div>
        </div>

        {/* Советы */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h2 className="text-base font-semibold text-white mb-3">Полезные советы</h2>
          <ul className="space-y-2 text-sm text-white/80">
            <li>• Отвечайте честно - это поможет увидеть реальный паттерн</li>
            <li>• Заполняйте каждый день для точного анализа</li>
            <li>• Читайте описания тонов и печатей для лучшего понимания</li>
            <li>• Используйте заметки для ключевых событий дня</li>
            <li>• Через 13 дней вы увидите полную картину своей волны</li>
          </ul>
        </div>

      </div>
    </div>
  );
};