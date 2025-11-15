import { useState, useEffect } from 'react'
import MainHome from './components/MainHome.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import LuceroHome from './components/LuceroHome.jsx'
import OrderFlow from './components/OrderFlow.jsx'
import ManageMenu from './components/ManageMenu.jsx'
import PrintOrder from './components/PrintOrder.jsx'
import CoffeeOrderFlow from './components/CoffeeOrderFlow.jsx'
import CoffeePrintOrder from './components/CoffeePrintOrder.jsx'

function App() {
  const [currentView, setCurrentView] = useState('main-home')
  const [currentSection, setCurrentSection] = useState(null) // 'ebyyard' or 'luceroyard'
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    // Supabase doesn't need initialization, set ready immediately
    setDbReady(true)
  }, [])

  const handleNavigation = (view) => {
    if (view === 'ebyyard') {
      setCurrentSection('ebyyard')
      setCurrentView('ebyyard-home')
    } else if (view === 'luceroyard') {
      setCurrentSection('luceroyard')
      setCurrentView('lucero-home')
    } else {
      setCurrentView(view)
    }
  }

  const handleBackToMain = () => {
    setCurrentView('main-home')
    setCurrentSection(null)
  }

  const handleBackToSection = () => {
    if (currentSection === 'ebyyard') {
      setCurrentView('ebyyard-home')
    } else if (currentSection === 'luceroyard') {
      setCurrentView('lucero-home')
    }
  }

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
      // Main navigation
      case 'main-home':
        return <MainHome onNavigate={handleNavigation} />

      // EbyYard (Sandwich) section
      case 'ebyyard-home':
        return <HomeScreen onNavigate={setCurrentView} onBack={handleBackToMain} />
      case 'order':
        return <OrderFlow onBack={handleBackToSection} />
      case 'manage-menu':
        return <ManageMenu onBack={handleBackToSection} />
      case 'print':
        return <PrintOrder onBack={handleBackToSection} />

      // LuceroYard (Coffee) section
      case 'lucero-home':
        return <LuceroHome onNavigate={setCurrentView} onBack={handleBackToMain} />
      case 'coffee-order':
        return <CoffeeOrderFlow onBack={handleBackToSection} />
      case 'coffee-print':
        return <CoffeePrintOrder onBack={handleBackToSection} />

      default:
        return <MainHome onNavigate={handleNavigation} />
    }
  }

  const renderHeader = () => {
    if (currentView === 'main-home') {
      return (
        <header className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4">
            <span className="text-4xl sm:text-5xl">
              <img src="/vbot.png" alt="Vbot" className="w-16" />
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            The Yard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Food & Coffee Experience</p>
        </header>
      )
    }

    if (currentSection === 'ebyyard') {
      return (
        <header className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4">
            <span className="text-2xl sm:text-3xl">
              <img src="/ebyyard.ico" alt="EbyYard" className="w-16" />
            </span>
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
          <a href="tel:+15489945072" className="text-blue-600 transition-colors text-sm sm:text-base block">(548) 994-5072</a>
        </header>
      )
    }

    if (currentSection === 'luceroyard') {
      return (
        <header className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4">
            <span className="text-4xl sm:text-5xl">
              <img src="/Lucero.png" alt="Lucero" className="w-16" />
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-navy-600 to-blue-800 bg-clip-text text-transparent mb-2">
            LuceroYard
          </h1>
        </header>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {renderHeader()}
        {renderCurrentView()}
      </div>
    </div>
  )
}

export default App
