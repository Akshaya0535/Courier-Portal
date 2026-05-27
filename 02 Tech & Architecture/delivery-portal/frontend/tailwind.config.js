/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // macOS System Colors
        'mac-blue':      '#007AFF',
        'mac-green':     '#34C759',
        'mac-red':       '#FF3B30',
        'mac-orange':    '#FF9500',
        'mac-yellow':    '#FFCC00',
        'mac-teal':      '#5AC8FA',
        'mac-indigo':    '#5856D6',
        'mac-purple':    '#AF52DE',
        'mac-pink':      '#FF2D55',
        // macOS Surface Colors
        'mac-bg':        '#F2F2F7',
        'mac-card':      '#FFFFFF',
        'mac-sidebar':   '#E5E5EA',
        'mac-border':    '#D1D1D6',
        'mac-label':     '#1C1C1E',
        'mac-secondary': '#8E8E93',
        'mac-fill':      '#F2F2F7',
        // Dark sidebar
        'sidebar-dark':  '#1C1C1E',
        'sidebar-item':  '#2C2C2E',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
