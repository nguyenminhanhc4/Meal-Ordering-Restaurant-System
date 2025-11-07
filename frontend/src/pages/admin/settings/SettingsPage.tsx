import React from "react";
import { useTheme } from "../../../store/ThemeContext";
import { Card, Radio, Label } from "flowbite-react";
import { useTranslation } from "react-i18next";

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-none">
        <h1 className="text-2xl font-bold">{t("admin.settings.title")}</h1>
      </div>
      <Card className="!bg-white">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {t("admin.settings.theme.title")}
        </h2>

        <div className="flex items-center gap-6">
          <Label className="flex !text-gray-800 items-center gap-2 cursor-pointer">
            <Radio
              name="theme"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
              className="!bg-white"
            />
            <span>{t("admin.settings.theme.light")}</span>
          </Label>

          <Label className="flex !text-gray-800 items-center gap-2 cursor-pointer">
            <Radio
              name="theme"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
              className="!bg-white"
            />
            <span>{t("admin.settings.theme.dark")}</span>
          </Label>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
