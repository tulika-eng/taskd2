import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Express backend (server.js) is NOT part of this React migration —
// per the task brief, only the frontend needs to move to React.
// This proxy just forwards /subscribe calls during `npm run dev` to your
// existing Express server, so keep server.js running on port 3000 alongside.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/subscribe': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
    },
  },
})
