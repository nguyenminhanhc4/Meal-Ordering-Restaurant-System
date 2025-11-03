import React, { useState } from "react";
import api from "../../api/axios";
import axios from "axios";
import { useNotification } from "../Notification";
import { FaUserLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const ForgotPasswordContent = ({
  notify,
}: {
  notify: (type: "success" | "error", message: string) => void;
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      notify("error", t("security.enterEmail"));
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      notify("success", t("security.forgotPasswordSent"));
      setEmail("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify("error", t("security.forgotPasswordFailed"));
      } else {
        notify("error", t("security.unknownError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleForgotPasswordSubmit}
      className="w-full max-w-lg bg-red-50 p-8 rounded-3xl shadow-lg border border-red-200 space-y-6">
      <h3 className="text-xl font-bold text-red-700 text-center">
        {t("security.forgotPasswordTitle")}
      </h3>
      <p className="text-sm text-red-600 text-center">
        {t("security.forgotPasswordDesc")}
      </p>

      <div>
        <label className="block text-red-700 mb-2" htmlFor="email">
          {t("security.emailLabel")}
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("security.emailPlaceholder")}
          required
          className="w-full p-3 border border-red-300 rounded-xl placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition disabled:opacity-50">
        {loading ? t("security.sending") : t("security.sendRequest")}
      </button>
    </form>
  );
};

export default function UserSecuritySettings() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState("changePassword");
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = t("security.currentPasswordRequired");
    }
    if (form.newPassword.length < 8) {
      newErrors.newPassword = t("security.passwordMinLength");
    } else if (!/[A-Z]/.test(form.newPassword)) {
      newErrors.newPassword = t("security.passwordUppercase");
    } else if (!/[a-z]/.test(form.newPassword)) {
      newErrors.newPassword = t("security.passwordLowercase");
    } else if (!/[0-9]/.test(form.newPassword)) {
      newErrors.newPassword = t("security.passwordNumber");
    } else if (!/[!@#$%^&*()_+\-={}[\]|;:'",.<>/?]/.test(form.newPassword)) {
      newErrors.newPassword = t("security.passwordSpecialChar");
    }
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = t("security.confirmPasswordMismatch");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await api.put("/users/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      notify("success", t("security.passwordChanged"));
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        notify(
          "error",
          err.response?.data?.message || t("security.passwordChangeFailed")
        );
      } else {
        notify("error", t("security.unknownError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (tabName: string) =>
    `inline-block w-full py-3 px-4 text-center font-semibold rounded-t-lg transition-all duration-300 cursor-pointer ${
      activeTab === tabName
        ? "bg-white text-blue-600 border-b-4 border-blue-600"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-b-4 border-transparent"
    }`;

  return (
    <div className="w-full max-w-4xl p-8 bg-white rounded-3xl shadow-2xl border border-blue-800">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center border-b pb-3">
        <FaUserLock className="mr-2 text-yellow-500" />
        {t("security.title")}
      </h2>

      <div className="text-sm font-medium text-center text-gray-500 mb-6">
        <ul className="flex -mb-4">
          <li className="flex-1">
            <a
              onClick={() => setActiveTab("changePassword")}
              className={tabClass("changePassword")}>
              {t("security.tabChangePassword")}
            </a>
          </li>
          <li className="flex-1">
            <a
              onClick={() => setActiveTab("forgotPassword")}
              className={tabClass("forgotPassword")}>
              {t("security.tabForgotPassword")}
            </a>
          </li>
        </ul>
        <div className="border-b-2 border-gray-200"></div>
      </div>

      <div className="tab-content flex justify-center pt-4">
        {activeTab === "changePassword" && (
          <form
            className="w-full max-w-lg space-y-6 bg-blue-50 p-8 rounded-3xl shadow-lg border border-blue-200"
            onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold text-blue-800 text-center">
              {t("security.changePasswordTitle")}
            </h3>

            <div>
              <label className="block text-blue-700 mb-2">
                {t("security.currentPasswordLabel")}
              </label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                placeholder={t("security.currentPasswordPlaceholder")}
                onChange={handleChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 ${
                  errors.currentPassword
                    ? "border-red-500 focus:ring-red-400"
                    : "border-blue-300 placeholder:text-blue-400 focus:ring-blue-500"
                } transition`}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-blue-700 mb-2">
                {t("security.newPasswordLabel")}
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder={t("security.newPasswordPlaceholder")}
                className={`w-full p-3 border rounded-xl focus:ring-2 ${
                  errors.newPassword
                    ? "border-red-500 focus:ring-red-400"
                    : "border-blue-300 placeholder:text-blue-400 focus:ring-blue-500"
                } transition`}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-blue-700 mb-2">
                {t("security.confirmPasswordLabel")}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder={t("security.confirmPasswordPlaceholder")}
                className={`w-full p-3 border rounded-xl focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-400"
                    : "border-blue-300 placeholder:text-blue-400 focus:ring-blue-500"
                } transition`}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50">
              {loading
                ? t("security.updating")
                : t("security.changePasswordBtn")}
            </button>
          </form>
        )}

        {activeTab === "forgotPassword" && (
          <ForgotPasswordContent notify={notify} />
        )}
      </div>
    </div>
  );
}
