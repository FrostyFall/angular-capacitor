import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'zoom-clone',
  webDir: 'dist/zoom-clone',
  server: {
    androidScheme: 'https',
  },
};

export default config;
