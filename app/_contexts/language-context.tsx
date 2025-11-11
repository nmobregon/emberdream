"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  en: {
    // Header
    "header.title": "Ember Dream",
    "header.donate": "Buy me a coffee",
    
    // Home page
    "home.hero.title": "Light your candle, share your wishes",
    "home.hero.subtitle": "Each flame burns for 12 hours, carrying intentions and dreams from around the world",
    "home.empty.title": "No candles lit yet... be the first!",
    "home.empty.subtitle": "Click the button below to light your candle",
    
    // Candle card
    "candle.by": "by",
    "candle.on": "on",
    "candle.copy": "Copy Link",
    "candle.share": "Share",
    "candle.placeholder": "Waiting for your wish",
    
    // Dialog
    "dialog.title": "Light a candle",
    "dialog.country": "Country",
    "dialog.country.placeholder": "Select country",
    "dialog.color": "Candle Color",
    "dialog.name": "Name",
    "dialog.name.placeholder": "Your name",
    "dialog.wish": "Wish",
    "dialog.wish.placeholder": "Your wish or intention",
    "dialog.submit": "Light",
    "dialog.fab.title": "Light a new candle",
    
    // Individual candle page
    "candle.page.title": "A Candle of Hope",
    "candle.page.subtitle": "Sharing light and intentions with the world",
    "candle.page.time.remaining": "Time Remaining",
    "candle.page.time.expired": "Flame Extinguished",
    "candle.page.wish.title": "The Wish",
    "candle.page.message": "This flame carries a wish into the universe. May it bring light to someone's path.",
    
    // Tour
    "tour.welcome.title": "Welcome",
    "tour.welcome.description": "Ember Dream lets you express your wishes and intentions with a 12-hour-lasting flame",
    "tour.spark.title": "Spark the fire!",
    "tour.spark.description": "Click here to light your candle and input your country, name and wish",
    "tour.donate.title": "Donate",
    "tour.donate.description": "This site is non-profit but still requires effort and time. If you consider it's worth a dollar, the team will gratefully accept your donation.",
    "tour.farewell.title": "May all your wishes come true",
    "tour.farewell.description": "The Ember Dream team wishes you the best.",
  },
  es: {
    // Header
    "header.title": "Ember Dream",
    "header.donate": "Invítame un cafecito",
    
    // Home page
    "home.hero.title": "Enciende tu vela, comparte tus deseos",
    "home.hero.subtitle": "Cada llama arde por 12 horas, llevando intenciones y sueños de todo el mundo",
    "home.empty.title": "No hay velas encendidas aún... ¡sé el primero!",
    "home.empty.subtitle": "Haz clic en el botón de abajo para encender tu vela",
    
    // Candle card
    "candle.by": "por",
    "candle.on": "el",
    "candle.copy": "Copiar enlace",
    "candle.share": "Compartir",
    "candle.placeholder": "Esperando tu deseo",
    
    // Dialog
    "dialog.title": "Prender una vela",
    "dialog.country": "País",
    "dialog.country.placeholder": "Selecciona país",
    "dialog.color": "Color de la Vela",
    "dialog.name": "Nombre",
    "dialog.name.placeholder": "Tu nombre",
    "dialog.wish": "Intención",
    "dialog.wish.placeholder": "Tu deseo o intención",
    "dialog.submit": "Encender",
    "dialog.fab.title": "Encender una nueva vela",
    
    // Individual candle page
    "candle.page.title": "Una Vela de Esperanza",
    "candle.page.subtitle": "Compartiendo luz e intenciones con el mundo",
    "candle.page.time.remaining": "Tiempo Restante",
    "candle.page.time.expired": "Llama Extinguida",
    "candle.page.wish.title": "El Deseo",
    "candle.page.message": "Esta llama lleva un deseo al universo. Que traiga luz al camino de alguien.",
    
    // Tour
    "tour.welcome.title": "Bienvenid@",
    "tour.welcome.description": "Ember Dream te permite expresar tus deseos e intenciones prendiendo una llama que dura 12 horas",
    "tour.spark.title": "¡Enciende el fuego!",
    "tour.spark.description": "Haciendo clic aquí puedes encender tu vela ingresando tu país, nombre y deseo o intención",
    "tour.donate.title": "Donar",
    "tour.donate.description": "Este sitio no tiene fines de lucro, pero sí implica esfuerzo y tiempo. Si consideras que vale la pena, el equipo agradece tu donación.",
    "tour.farewell.title": "Que todos tus sueños se cumplan",
    "tour.farewell.description": "El equipo de Ember Dream te desea lo mejor!",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("ember-dream-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "es")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("ember-dream-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

