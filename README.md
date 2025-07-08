# 🔥 Pomoflare — bursts of productivity


**Live Demo:** [https://pomoflare.vercel.app/](https://pomoflare.vercel.app/)

Pomoflare is a modern, feature-rich Pomodoro productivity application designed to help you maximize focus and track your workflow. Built with Vite, React, TypeScript, and the latest UI libraries, Pomoflare empowers you with intuitive controls, beautiful design, and insightful analytics — all in one blazing-fast webapp.

---

## 🚀 Features

- **Customizable Pomodoro Timers**: Set work/break intervals, long breaks, and cycles to fit your routine.
- **Session Analytics & Charts**: Visualize your productivity with dynamic charts and statistics.
- **Task Management**: Organize and prioritize your tasks for each session.
- **Responsive UI**: Fully optimized for desktop and mobile; smooth UX everywhere.
- **Dark/Light Mode**: Seamless theme switching with `next-themes` and Tailwind CSS.
- **Productivity Streaks**: Track daily and weekly progress.
- **Progress Notifications & Toasts**: Real-time feedback with Radix UI and Sonner.
- **PWA Support**: Installable on desktop and mobile (via Vite PWA).
- **Accessibility**: Built using Radix UI’s accessible components.
- **Persistent State**: Sessions and tasks saved locally.
- **Command Palette**: Fast keyboard navigation and actions (powered by `cmdk`).
- **Interactive Charts**: Visualize stats with Recharts.
- **User Avatars & Profiles**: Personalize your experience.
- **Settings Panel**: Fine-tune everything from notification sounds to timer lengths.
- **Beautiful Animations**: TailwindCSS Animate and smooth transitions.
- **Modular and Typed Codebase**: Built with TypeScript and modern best practices.

---

## 🛠️ Codebase & Technologies

**Core Tech Stack:**

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (with `tailwind-merge`, `tailwindcss-animate`), clsx, class-variance-authority
- **UI Components:** Radix UI (Accordion, Dialog, Tabs, Tooltip, etc.), Shadcn UI, Lucide React icons
- **State Management:** React Context, React Hook Form, Zod (schema validation)
- **Routing:** React Router DOM
- **Data Fetching:** TanStack React Query
- **Charts & Visualization:** Recharts
- **Carousel:** Embla Carousel
- **PWA:** vite-plugin-pwa
- **Notifications:** Sonner
- **Avatar/OTP:** Radix Avatar, input-otp
- **Other:** PostCSS, Autoprefixer, ESLint, TypeScript, Prettier

**Notable Libraries:**
- `@radix-ui/*` — Accessible React primitives for building UI
- `react-hook-form` — Powerful forms and validation
- `zod` — Type-safe data schemas
- `cmdk` — Command palette for fast navigation
- `react-day-picker` — Calendar and date picking
- `vaul` — Drawer and modal UI
- `react-resizable-panels` — Layouts with resizable panels

---

## 📁 Project Structure

```
Pomoflare/
│
├── public/               # Static assets, manifest, favicon
├── src/
│   ├── assets/           # Images, icons, illustrations
│   ├── components/       # All reusable UI components
│   ├── features/         # Business logic (pomodoro, analytics, tasks)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page-level components and routes
│   ├── utils/            # Helper functions, utilities
│   ├── styles/           # Tailwind & custom CSS
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

---

## 🌈 UI/UX Design

- **Minimal, Distraction-Free Layout:** Focus on productivity.
- **Accessible Color Contrast:** WCAG-compliant color palette.
- **Responsive Animations:** Microinteractions for feedback.
- **Keyboard Navigation:** Command palette and tab support.
- **Radix Theme System:** Consistent, scalable components.

---

## 🚦 How to Deploy

### 1. **Clone the Repository**

```bash
git clone https://github.com/maruf009sultan/Pomoflare.git
cd Pomoflare
```

### 2. **Install Dependencies**

```bash
npm install
# or
yarn install
```

### 3. **Run Development Server**

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### 4. **Build for Production**

```bash
npm run build
# or
yarn build
```

The production-ready files will be in the `dist/` directory.

### 5. **Preview Production Build**

```bash
npm run preview
# or
yarn preview
```

### 6. **Deploy**

- **Netlify:** Connect your GitHub repo and deploy, or drag-and-drop the `dist/` folder in Netlify dashboard.
- **Vercel:** Import project via GitHub, auto-deploy.
- **Static Hosting:** Upload `dist/` to your web server.

#### **Live Example:**  
[https://pomoflare.vercel.app/](https://pomoflare.vercel.app/)

---

## 🧑‍💻 Development Scripts

- `npm run dev` — Start local dev server
- `npm run build` — Build for production
- `npm run preview` — Preview built app locally
- `npm run lint` — Lint code with ESLint

---

## 📚 Advanced Customization

- **Theme Customization:** Update `tailwind.config.js` for new colors or typography.
- **Add New Features:** Use the modular `features/` and `components/` directories.
- **PWA Settings:** Edit `vite.config.ts` to tweak PWA manifest and caching.
- **Analytics:** Integrate your own analytics (e.g., Plausible, Google Analytics) in `src/main.tsx`.

---

## 🤝 Contributing

Pull requests and suggestions are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📝 License

MIT with Attribution

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of Pomoflare for any purpose, **as long as you provide proper credit** by:

- Mentioning the original author: [maruf009sultan](https://github.com/maruf009sultan)
- Linking back to this repository: [github.com/maruf009sultan/Pomoflare](https://github.com/maruf009sultan/Pomoflare)

A copy of this license is included below.

---

```
MIT with Attribution License

Copyright (c) 2025 maruf009sultan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

**Attribution Requirement:**  
If you use, modify, publish, or distribute this software, you must give appropriate credit to the original author (maruf009sultan) and provide a link to the project repository.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📢 Attribution

Created by [maruf009sultan](https://github.com/maruf009sultan)  
Project Link: [github.com/maruf009sultan/Pomoflare](https://github.com/maruf009sultan/Pomoflare)

---

Enjoy your bursts of productivity! 🚀
