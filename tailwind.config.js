/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors from Logo
        primary: {
          blue: '#0C3968',        // Dark blue - primary
          'blue-light': '#1188C9', // Light blue - secondary
          green: '#82C53A',        // Vibrant green - accent/CTA
          teal: '#C0D9C7',        // Light teal - subtle accents
        },
        // Neutral grays for backgrounds, text, borders
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Alias for easier use
        'primary-blue': '#0C3968',
        'primary-blue-light': '#1188C9',
        'primary-green': '#82C53A',
        'primary-teal': '#C0D9C7',
        // Admin design system (mirrored as CSS variables in index.css)
        admin: {
          blue: '#0C3968',        // Primary - sidebar, buttons, active states (brand navy)
          'blue-hover': '#1188C9',// Primary hover (brand light blue)
          bg: '#EEF3F8',          // Page background (navy-tinted light gray)
          surface: '#FFFFFF',     // Main surface
          text: '#1F2937',        // Primary text (gray-800)
          muted: '#6B7280',       // Secondary text (gray-500)
          border: '#E5E7EB',      // Borders (gray-200)
          pending: '#D96B6B',     // Pending status
          success: '#82C53A',     // Active/completed status (brand green)
          neutral: '#9CA3AF',     // Inactive/neutral status (gray-400)
        },
      },
    },
  },
  plugins: [],
}
