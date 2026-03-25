// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,jsx}'],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           50: '#f0f4ff',
//           100: '#e0e9ff',
//           500: '#4361ee',
//           600: '#3451d1',
//           700: '#2740b8',
//           900: '#1a2a7a',
//         },
//         slate: {
//           850: '#1a2035',
//           950: '#0d1117',
//         }
//       },
//       fontFamily: {
//         sans: ['DM Sans', 'system-ui', 'sans-serif'],
//         display: ['Syne', 'system-ui', 'sans-serif'],
//         mono: ['JetBrains Mono', 'monospace'],
//       },
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8"
        }
      }
    }
  },
  plugins: [],
}