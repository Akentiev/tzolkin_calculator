const BottomNavigation = ({ currentScreen, setCurrentScreen }) => {
  const navItems = [
    {
      id: 'home',
      label: 'Домой',
      icon: '🏠',
      screen: 'home'
    },
    {
      id: 'wave',
      label: 'Волна',
      icon: '🌀',
      screen: 'wave'
    },
    {
      id: 'history',
      label: 'История',
      icon: '📊',
      screen: 'history'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-purple-500/30">
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.screen)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                currentScreen === item.screen
                  ? 'bg-purple-600/20 text-purple-300 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium">{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};