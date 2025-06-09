// ANCHOR: home-screen-component
function HomeScreen({ onNavigate }) {
  const buttons = [
    {
      id: 'order',
      title: 'Place Order',
      description: 'Start a new sandwich order',
      icon: '🍽️',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      id: 'edit',
      title: 'Edit Menu',
      description: 'Manage sandwich options',
      icon: '✏️',
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-emerald-700',
    },
    {
      id: 'print',
      title: 'View Orders',
      description: 'See and print today\'s orders',
      icon: '📋',
      gradient: 'from-violet-500 to-violet-600',
      hoverGradient: 'hover:from-violet-600 hover:to-violet-700',
    }
  ]

  return (
    <div className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 text-gray-800">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 text-sm sm:text-base mb-8">
          What would you like to do today?
        </p>

        <div className="space-y-4">
          {buttons.map((button) => (
            <button
              key={button.id}
              onClick={() => onNavigate(button.id)}
              className={`group w-full bg-gradient-to-r ${button.gradient} ${button.hoverGradient}
                text-white font-semibold py-4 sm:py-5 px-6 rounded-xl transition-all duration-200
                shadow-lg hover:shadow-xl border border-white/20`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl sm:text-3xl">
                  {button.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-base sm:text-lg font-bold">{button.title}</div>
                  <div className="text-xs sm:text-sm opacity-90 font-normal">{button.description}</div>
                </div>
                <div className="text-white/70 group-hover:text-white transition-colors duration-200">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
