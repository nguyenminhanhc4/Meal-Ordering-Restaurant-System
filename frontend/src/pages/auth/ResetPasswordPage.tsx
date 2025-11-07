import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { AxiosError } from "axios";
import { useNotification } from "../../components/Notification/";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { password?: string; confirm?: string } = {};

    if (!password.trim()) {
      newErrors.password = t("auth.reset.error.requiredPassword");
    }

    if (!confirmPassword.trim()) {
      newErrors.confirm = t("auth.reset.error.requiredConfirm");
    }

    if (password.length < 8)
      newErrors.password = t("auth.reset.error.shortPassword");
    else if (!/[A-Z]/.test(password))
      newErrors.password = t("auth.reset.error.uppercase");
    else if (!/[a-z]/.test(password))
      newErrors.password = t("auth.reset.error.lowercase");
    else if (!/[0-9]/.test(password))
      newErrors.password = t("auth.reset.error.number");
    else if (!/[!@#$%^&*()_+\-={}[\]|;:'",.<>/?]/.test(password))
      newErrors.password = t("auth.reset.error.specialChar");

    if (password !== confirmPassword)
      newErrors.confirm = t("auth.reset.error.passwordMismatch");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      notify("error", t("auth.reset.error.invalidToken"));
      return;
    }

    try {
      setLoading(true);
      await api.post(
        "/auth/reset-password",
        {
          token,
          newPassword: password,
        },
        {
          headers: {
            "Accept-Language": i18n.language,
          },
        }
      );
      notify("success", t("auth.reset.success"));
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        notify("error", err.response?.data?.message || t("auth.reset.failure"));
      } else {
        notify("error", t("auth.common.unexpectedError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 flex items-center justify-center py-12 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-lg p-10 bg-white rounded-2xl shadow-xl relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-2xl z-10">
            <span className="text-blue-600 font-semibold text-lg">
              {t("auth.reset.loading")}
            </span>
          </div>
        )}

        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          {t("auth.reset.title")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-0">
          <div>
            <label className="block text-gray-700 mb-1">
              {t("auth.reset.newPasswordLabel")}
            </label>
            <input
              type="password"
              placeholder={t("auth.reset.newPasswordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 border rounded-xl focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              {t("auth.reset.confirmPasswordLabel")}
            </label>
            <input
              type="password"
              placeholder={t("auth.reset.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-3 border rounded-xl focus:ring-2 ${
                errors.confirm
                  ? "border-red-500 focus:ring-red-400"
                  : "focus:ring-blue-500"
              }`}
            />
            {errors.confirm && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {t("auth.reset.submit")}
          </button>
        </form>
      </div>
    </section>
  );
}
