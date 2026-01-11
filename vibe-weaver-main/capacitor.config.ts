import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abhishek.bookit',
  appName: 'Vibe Weaver',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'http://localhost:10000',
      'https://accounts.google.com',
      'https://www.googleapis.com'
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f0f14',
      overlaysWebView: false,
    },
  },
};

export default config;
