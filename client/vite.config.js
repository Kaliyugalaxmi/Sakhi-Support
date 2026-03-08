import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "unrevetted-outfly-faye.ngrok-free.dev"
    ]
  }
})