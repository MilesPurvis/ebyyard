import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StatsigProvider } from './providers/StatsigProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StatsigProvider>
      <App />
    </StatsigProvider>
  </StrictMode>,
)
