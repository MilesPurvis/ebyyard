import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars (including those without VITE_ prefix in Node.js context)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Expose NEXT_PUBLIC_STATSIG_CLIENT_KEY as VITE_STATSIG_CLIENT_KEY for compatibility
    define: {
      'import.meta.env.VITE_STATSIG_CLIENT_KEY': JSON.stringify(
        env.NEXT_PUBLIC_STATSIG_CLIENT_KEY || env.VITE_STATSIG_CLIENT_KEY || ''
      ),
    },
  }
})
