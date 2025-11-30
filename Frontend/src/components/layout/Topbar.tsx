import { Sun, Moon } from "lucide-react";
import { useState } from "react";

const Topbar = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-6">
      <input
        type="text"
        placeholder="Search…"
        className="w-96 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 outline-none"
      />
      <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800">
        {theme === "light" ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
      </button>
    </header>
  );
};

export default Topbar;