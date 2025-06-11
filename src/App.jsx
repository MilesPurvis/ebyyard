import { useState, useEffect } from 'react'
import HomeScreen from './components/HomeScreen.jsx'
import OrderFlow from './components/OrderFlow.jsx'
import SandwichEditor from './components/SandwichEditor.jsx'
import PrintOrder from './components/PrintOrder.jsx'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    // Supabase doesn't need initialization, set ready immediately
    setDbReady(true)
  }, [])

  const renderCurrentView = () => {
    if (!dbReady) {
      return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20">
          <div className="relative">
            <div className="animate-spin w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 mt-6 text-sm sm:text-base animate-pulse">Initializing database...</p>
        </div>
      )
    }

    switch (currentView) {
      case 'order':
        return <OrderFlow onBack={() => setCurrentView('home')} />
      case 'edit':
        return <SandwichEditor onBack={() => setCurrentView('home')} />
      case 'print':
        return <PrintOrder onBack={() => setCurrentView('home')} />
      default:
        return <HomeScreen onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <header className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl sm:text-3xl">🥪</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            EbyYard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Eby Street Bodega</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=16+Eby+St+N+Kitchener+ON"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 transition-colors text-sm sm:text-base block"
          >
            16 Eby St N, Kitchener, ON
          </a>
          <a href="tel:+15197411111" className="text-blue-600 transition-colors text-sm sm:text-base block">(519) 741-1111</a>
        </header>
        {renderCurrentView()}
      </div>
    </div>
  )
}

export default App
