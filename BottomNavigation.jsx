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
    <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div
          className="glass-card-strong rounded-[28px] p-3 shadow-2xl"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="grid grid-cols-3 gap-3">
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
                    className={`min-h-[60px] rounded-3xl transition-all duration-300 active:scale-[0.95] ${isActive
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-white border border-cyan-400/30'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90 border border-white/10'
                      }`}
                    style={isActive ? {
                      boxShadow: '0 0 20px rgba(0, 150, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    } : {}}
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                      <div className="h-6 w-6 flex items-center justify-center">
                        {Icon ? <Icon size={22} strokeWidth={isActive ? 2 : 1.5} /> : <span className="text-xl">{item.icon.emoji}</span>}
                      </div>
                      <div className={`text-[11px] font-medium leading-none ${isActive ? 'font-semibold' : ''}`}>
                        {item.label}
                      </div>
                    </div>
                  </button>
                );
              })()
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};