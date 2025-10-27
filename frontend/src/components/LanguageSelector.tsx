// src/components/LanguageSelector.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineGlobe } from "react-icons/hi";

interface LanguageSelectorProps {
  compact?: boolean; // hiển thị gọn khi trong dropdown
  onChange?: (lang: string) => void;
}

const languages = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  onChange,
}) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    if (onChange) onChange(lang);
  };

  return (
    <div className="flex flex-col items-start w-full">
      {!compact && (
        <div className="flex items-center gap-2 mb-2 text-gray-200">
          <HiOutlineGlobe className="text-yellow-400" />
          <span>{t("navbarLanding.dropdown.lang")}</span>
        </div>
      )}

      <div className="flex gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`text-sm rounded px-2 py-1 transition ${
              i18n.language === lang.code
                ? "bg-yellow-400 text-black"
                : "text-gray-300 hover:text-yellow-400"
            }`}>
            {lang.flag} {compact ? "" : lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
