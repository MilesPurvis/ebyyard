import { useEffect, useState } from 'react'
import { StatsigProvider as StatsigProviderBase } from '@statsig/react-bindings'

// ANCHOR: statsig-initialization
export function StatsigProvider({ children }) {
  const [clientKey, setClientKey] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get Statsig client key from environment variables
    const key = import.meta.env.VITE_STATSIG_CLIENT_KEY

    console.log('🔍 Statsig Provider: Checking for client key...')
    console.log('🔍 Key exists:', !!key)
    console.log('🔍 Key prefix:', key ? key.substring(0, 20) + '...' : 'none')

    if (!key) {
      console.warn('⚠️ Statsig client key not found. Feature flags will not work.')
      console.warn('⚠️ Make sure VITE_STATSIG_CLIENT_KEY is set in .env.local and dev server is restarted')
      return
    }

    // Set both key and user at the same time to avoid race conditions
    setClientKey(key)
    setUser({
      userID: 'anonymous', // Replace with actual user ID when available
      // Add custom user properties as needed:
      // email: 'user@example.com',
      // custom: { plan: 'premium' }
    })

    console.log('✅ Statsig Provider: Key and user set, initializing...')
  }, [])

  if (!clientKey) {
    // Render children without Statsig if key is not available
    return <>{children}</>
  }

  return (
    <StatsigProviderBase
      clientKey={clientKey}
      user={user}
      options={{
        // Optional: Configure Statsig options
        // environment: 'production', // or 'development'
        // api: 'https://api.statsig.com', // Custom API endpoint if needed
        // Disable analytics to reduce console noise (optional)
        disableAutoMetricsLogging: false, // Keep false if you want analytics
      }}
    >
      {children}
    </StatsigProviderBase>
  )
}
