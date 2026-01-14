const BottomNavigation = ({ currentScreen, setCurrentScreen }) => {
  const navItems = [
    {
      id: 'home',
      label: 'Домой',
      icon: {
        emoji: '🏠',
        lucide: 'Home'
      },
      screen: 'home'
    },
    {
      id: 'wave',
      label: 'Волна',
      icon: {
        emoji: '🌀',
        lucide: 'Waves'
      },
      screen: 'wave'
    },
    {
      id: 'history',
      label: 'История',
      icon: {
        emoji: '📊',
        lucide: 'BarChart3'
      },
      screen: 'history'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          {navItems.map((item) => (
            (() => {
              const isActive = currentScreen === item.screen;
              const Icon = window.LucideReact?.[item.icon.lucide];

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    window.tgHapticLight?.();
                    setCurrentScreen(item.screen);
                  }}
                  className={`min-h-[56px] rounded-3xl border transition duration-300 active:scale-[0.98] ${isActive
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90'
                    }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1 py-2">
                    <div className="h-6 w-6 flex items-center justify-center">
                      {Icon ? <Icon size={20} strokeWidth={1.5} /> : <span className="text-lg">{item.icon.emoji}</span>}
                    </div>
                    <div className="text-[11px] font-medium leading-none">{item.label}</div>
                  </div>
                </button>
              );
            })()
          ))}
        </div>
      </div>
    </div>
  );
};