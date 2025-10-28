import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import vi from "./locales/vi/translation.json";

i18n
  .use(LanguageDetector) // tự động phát hiện ngôn ngữ người dùng
  .use(initReactI18next) // tích hợp với React
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: "vi",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"], // lưu ngôn ngữ đã chọn
    },
  });

export default i18n;
