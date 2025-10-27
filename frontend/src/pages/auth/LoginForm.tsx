import { useState } from "react";
import { Spinner, Button, Label, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { AxiosError } from "axios";
import api from "../../api/axios";
import { useAuth } from "../../store/AuthContext";
import { useNotification } from "../../components/Notification/NotificationContext";
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("auth.login.error.invalidEmailFormat");
    }

    if (!email.includes("@")) {
      newErrors.email = t("auth.login.error.invalidEmail");
    }

    if (password.length < 8) {
      newErrors.password = t("auth.login.error.shortPassword");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const response = await api.post(
          "/auth/login",
          { email, password },
          { withCredentials: true }
        );

        console.log("Login success:", response.data);

        navigate("/");
        notify("success", t("auth.login.success"));
        await refreshUser();
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          notify("error", t("auth.login.failure"));
        } else {
          notify("error", t("auth.common.unexpectedError"));
          console.error("Unexpected error:", error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      notify("error", t("auth.forgot.error.emptyEmail"));
      return;
    }

    try {
      setForgotLoading(true);
      await api.post("/auth/forgot-password", { email: forgotEmail });

      notify("success", t("auth.forgot.success"));
      setForgotEmail("");
      setShowForgotModal(false);
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      notify("error", t("auth.forgot.failure"));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        {t("auth.login.title")}
      </h2>

      <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <Label htmlFor="email" className="!text-gray-100">
            {t("auth.login.emailLabel")}
          </Label>
          <TextInput
            id="email"
            type="text"
            placeholder={t("auth.login.emailPlaceholder")}
            required
            color={errors.email ? "failure" : "gray"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            theme={{
              field: {
                input: {
                  base: "!bg-stone-700 !text-white !border-stone-600",
                },
              },
            }}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <Label htmlFor="password" className="!text-gray-100">
            {t("auth.login.passwordLabel")}
          </Label>
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            maxLength={20}
            color={errors.password ? "failure" : "gray"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            theme={{
              field: {
                input: {
                  base: "!bg-stone-700 !text-white !border-stone-600",
                },
              },
            }}
          />
          <button
            type="button"
            className="absolute inset-y-11 right-0 flex items-center pr-3 !text-gray-300 hover:!text-white"
            onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex justify-end mt-1">
          <button
            type="button"
            className="text-yellow-300 hover:text-yellow-400 text-sm"
            onClick={() => setShowForgotModal(true)}>
            {t("auth.login.forgotPassword")}
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:opacity-90"
          disabled={loading}
          fullSized>
          {loading && <Spinner size="sm" light={true} />}
          {loading ? t("auth.login.loading") : t("auth.login.submit")}
        </Button>
      </form>

      {/* Switch to Register */}
      <p className="text-sm text-gray-300 text-center mt-6">
        {t("auth.login.noAccount")}{" "}
        <Link to="/register" className="text-yellow-300 hover:text-yellow-400">
          {t("auth.login.registerLink")}
        </Link>
      </p>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-stone-800 rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {t("auth.forgot.title")}
            </h3>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                placeholder={t("auth.forgot.emailPlaceholder")}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-xl placeholder:text-gray-400 bg-stone-700 border-stone-600 text-white focus:ring-2 focus:ring-yellow-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="py-2 px-4 rounded-xl bg-orange-500 hover:bg-orange-600"
                  disabled={forgotLoading}>
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="py-2 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                  {forgotLoading ? t("common.sending") : t("common.send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
