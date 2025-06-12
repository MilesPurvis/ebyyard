// ANCHOR: lucero-home-component
function LuceroHome({ onNavigate, onBack }) {
  const buttons = [
    {
      id: 'coffee-order',
      title: 'Place Coffee Order',
      description: 'Start a new coffee order',
      icon: '☕',
      gradient: 'from-blue-800 to-blue-900',
      hoverGradient: 'hover:from-blue-900 hover:to-slate-900',
    },
    {
      id: 'coffee-print',
      title: 'View Coffee Orders',
      description: 'See and print today\'s coffee orders',
      icon: '📋',
      gradient: 'from-violet-500 to-violet-600',
      hoverGradient: 'hover:from-violet-600 hover:to-violet-700',
    }
  ]

  return (
    <div className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Back
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="text-4xl mb-4">☕</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            LuceroYard
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Lucero Canteen
          </p>
        </div>

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

export default LuceroHome
