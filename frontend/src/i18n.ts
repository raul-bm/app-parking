import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";
import val from "./locales/val.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      val: { translation: val },
    },
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
