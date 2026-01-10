import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abhishek.vibeweaver',
  appName: 'Vibe Weaver',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    allowNavigation: ['http://localhost:10000']
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
