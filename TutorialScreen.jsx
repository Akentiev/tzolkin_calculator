const TutorialScreen = ({ seals, tones, setShowTutorial }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">

      {/* Заголовок */}
      <div className="max-w-2xl mx-auto mb-6 text-center">
        <h1 className="text-3xl font-bold text-purple-300">Обучение Tzolk'in</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 pb-20">

        {/* Введение */}
        <div className="p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Что такое Tzolk'in?</h2>
          <p className="text-gray-300 mb-4">
            Tzolk'in (Цолькин) - это священный календарь майя, основанный на 260-дневном цикле.
            Он состоит из 20 печатей (солнечных знаков) и 13 тонов (волновых гармоник).
          </p>
          <p className="text-gray-300">
            Каждый день имеет уникальную комбинацию тона и печати, которая определяет энергию,
            возможности и уроки этого дня.
          </p>
        </div>

        {/* Печати */}
        <div className="p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-300 mb-4">20 Печатей</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {seals.map((seal, index) => (
              <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                <div className="font-medium" style={{ color: seal.color }}>{seal.name}</div>
                <div className="text-gray-400 text-xs">{seal.essence}</div>
                <div className="text-gray-500 text-xs">{seal.element}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Тоны */}
        <div className="p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-300 mb-4">13 Тонов</h2>
          <div className="space-y-2 text-sm">
            {tones.map((tone) => (
              <div key={tone.n} className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Тон {tone.n} • {tone.name}</span>
                  <span className="text-purple-300 text-xs">{tone.phase}</span>
                </div>
                <div className="text-gray-400 text-xs mt-1">{tone.essence}</div>
                <div className="text-gray-500 text-xs">{tone.action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Как пользоваться приложением */}
        <div className="p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Как пользоваться приложением</h2>
          <div className="space-y-4 text-sm text-gray-300">
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
        <div className="p-6 bg-black/40 backdrop-blur-lg rounded-2xl border border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Полезные советы</h2>
          <ul className="space-y-2 text-sm text-gray-300">
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