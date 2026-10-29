import { useEffect, useState } from "react";
import { LanguageContext } from "./LanguageContext.js";
import { translations } from "./translation.js";

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Aplicar Dark Mode globalmente
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const changeDarkMode = (enabled) => {
    setDarkMode(enabled);
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        darkMode,
        changeDarkMode,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}