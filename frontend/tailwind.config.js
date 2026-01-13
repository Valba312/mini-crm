/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["\"Segoe UI\"", "Tahoma", "Arial", "sans-serif"],
        body: ["\"Segoe UI\"", "Tahoma", "Arial", "sans-serif"]
      },
      colors: {
        ink: "#0f172a",
        accent: "#0ea5e9",
        slate: {
          950: "#0b1120"
        }
      }
    }
  },
  plugins: []
};
