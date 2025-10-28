// src/components/LanguageSelector.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineGlobe } from "react-icons/hi";

interface LanguageSelectorProps {
  compact?: boolean;
  onChange?: (lang: string) => void;
  accentColor?: string;
  hoverColor?: string;
  activeBg?: string;
  inactiveText?: string;
  labelColor?: string;
}

const languages = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  onChange,
  accentColor = "text-yellow-400",
  hoverColor = "hover:text-yellow-400",
  activeBg = "bg-yellow-400 text-black",
  inactiveText = "text-gray-300",
  labelColor = "text-gray-200",
}) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    if (onChange) onChange(lang);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div
        className={`flex items-center justify-between w-full mb-2 px-1 ${labelColor}`}>
        <div className="flex items-center gap-2">
          <HiOutlineGlobe className={`${accentColor} text-lg`} />
          <span className="font-semibold text-sm tracking-wide">
            {t("navbarLanding.dropdown.lang")}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 w-full">
        {languages.map((lang) => {
          const isActive = i18n.language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center justify-center gap-1 w-full rounded-md border border-stone-600 px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                isActive ? `${activeBg}` : `${inactiveText} ${hoverColor}`
              }`}>
              <span className="text-base">{lang.flag}</span>
              {!compact && <span>{lang.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default LanguageSelector;
