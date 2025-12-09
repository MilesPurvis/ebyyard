import { StatsigProvider as StatsigProviderBase, useClientAsyncInit } from '@statsig/react-bindings'
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics'
import { StatsigSessionReplayPlugin } from '@statsig/session-replay'

// ANCHOR: statsig-initialization
export function StatsigProvider({ children }) {
  // Get Statsig client key from environment variables
  // vite.config.js maps NEXT_PUBLIC_STATSIG_CLIENT_KEY to VITE_STATSIG_CLIENT_KEY at build time
  const clientKey = import.meta.env.VITE_STATSIG_CLIENT_KEY

  const { client } = useClientAsyncInit(
    clientKey || '',
    { userID: 'anonymous' },
    {
      plugins: [
        new StatsigAutoCapturePlugin(),
        new StatsigSessionReplayPlugin(),
      ],
      // Poll for updates every 30 seconds
      pollingIntervalMs: 30000,
    }
  )

  if (!clientKey) {
    console.warn('⚠️ Statsig client key not found. Feature flags will not work.')
    console.warn('⚠️ Make sure VITE_STATSIG_CLIENT_KEY is set in .env.local and dev server is restarted')
    // Render children without Statsig if key is not available
    return <>{children}</>
  }

  if (!client) {
    // Show loading state while client initializes
    return <div>Loading Statsig...</div>
  }

  return (
    <StatsigProviderBase client={client} loadingComponent={<div>Loading...</div>}>
      {children}
    </StatsigProviderBase>
  )
}
