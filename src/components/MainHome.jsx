// ANCHOR: main-home-component
function MainHome({ onNavigate }) {
  const restaurants = [
    {
      id: 'ebyyard',
      title: 'EbyYard',
      description: 'Eby Street Bodega - Sandwiches',
      icon: '🥪', // this should be the ebyyard.ico
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      address: '16 Eby St N, Kitchener, ON',
      phone: '(548) 994-5072',
    },
    {
      id: 'luceroyard',
      title: 'LuceroYard',
      description: 'Lucero Canteen - Coffee Shop',
      icon: '☕', // this should be the ebyyard.ico
      gradient: 'from-blue-800 to-blue-900',
      hoverGradient: 'hover:from-blue-900 hover:to-slate-900',
      address: '22 Ontario St N, Kitchener',
      phone: '',
    }
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-800">
          Welcome to the Yard!
        </h2>
        <p className="text-center text-gray-600 text-sm sm:text-base mb-8">
          Choose your dining experience
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => onNavigate(restaurant.id)}
              className={`group w-full bg-gradient-to-r ${restaurant.gradient} ${restaurant.hoverGradient}
                text-white font-semibold py-6 px-6 rounded-xl transition-all duration-200
                shadow-lg hover:shadow-xl border border-white/20 text-left`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="text-4xl sm:text-5xl">
                  {restaurant.icon}
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold mb-1">{restaurant.title}</div>
                  <div className="text-sm opacity-90 font-normal mb-2">{restaurant.description}</div>
                  <div className="text-xs opacity-80 font-normal">{restaurant.address}</div>
                  {restaurant.phone && (
                    <div className="text-xs opacity-80 font-normal">{restaurant.phone}</div>
                  )}
                </div>
                <div className="text-white/70 group-hover:text-white transition-colors duration-200 text-lg">
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

export default MainHome
