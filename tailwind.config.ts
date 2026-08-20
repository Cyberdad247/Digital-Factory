import type { Config } from 'tailwindcss';

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0B0E',
        gold: '#D4AF37',
        slate: '#2A2A35',
      },
    },
  },
  plugins: [],
};

export default config;
