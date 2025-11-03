import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Card } from "flowbite-react";
import api from "../../api/axios";
import { AxiosError } from "axios";
import { useNotification } from "../../components/Notification/NotificationContext";
import { useAuth } from "../../store/AuthContext";
import { useTranslation } from "react-i18next";

function AdminLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );

      // Gọi refreshUser để lấy thông tin user từ token
      const user = await refreshUser();

      console.log(user?.role);

      if (user?.role === "ADMIN" || user?.role === "STAFF") {
        notify("success", t("auth.login.success"));
        navigate("/admin/dashboard");
      } else {
        notify("error", t("auth.login.accessDenied"));
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        notify("error", err.response?.data.message || t("auth.login.failure"));
      } else {
        notify("error", t("auth.common.unexpectedError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-6 shadow-2xl rounded-lg border-l-8 !border-blue-600 dark:!bg-gray-800 dark:!border-blue-700">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
          {t("auth.login.adminTitle")}
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label
              htmlFor="email"
              className="mb-1 block text-gray-700 dark:text-gray-300">
              {t("auth.login.emailLabel")}
            </Label>
            <TextInput
              id="email"
              type="email"
              placeholder={t("auth.login.adminEmailPlaceholder")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sizing="lg"
            />
          </div>
          <div>
            <Label
              htmlFor="password"
              className="mb-1 block text-gray-700 dark:text-gray-300">
              {t("auth.login.passwordLabel")}
            </Label>
            <TextInput
              id="password"
              type="password"
              placeholder={t("auth.login.adminPasswordPlaceholder")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sizing="lg"
            />
          </div>
          <Button
            type="submit"
            color="blue"
            disabled={loading}
            className="w-full mt-4 py-2 text-lg font-semibold">
            {loading ? t("auth.login.loading") : t("auth.login.submit")}{" "}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AdminLogin;
