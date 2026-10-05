import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'co.solarbell.app',
  appName: 'SolarBell',
  webDir: 'dist',
  plugins: {
    // `fetch` nativo: la campana responde por http en 192.168.4.1, sin CORS ni contenido mixto.
    CapacitorHttp: { enabled: true },
  },
}

export default config
