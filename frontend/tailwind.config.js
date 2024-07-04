/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "col-span-1",
    "col-span-2",
    "col-span-3",
    "col-span-4",
    "col-span-5",
    "col-span-6",
    "text-end",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        "checkbox-12": "auto repeat(11, minmax(0, 1fr));",
        "checkbox-14": "auto repeat(13, minmax(0, 1fr));",
        "checkbox-16": "auto repeat(15, minmax(0, 1fr));",
        "checkbox-18": "auto repeat(17, minmax(0, 1fr));",
        "checkbox-12": "auto repeat(11, minmax(0, 1fr));",
        "checkbox-11": "auto 3fr repeat(9, minmax(0, 1fr));",
        "checkbox-16": "auto repeat(15, minmax(0, 1fr));",
        "input-12": "3fr repeat(11, minmax(0, 1fr));",
        "set-list": "1fr 3fr 3fr 1fr 1fr;",
      },
    },
  },
  plugins: [],
};
