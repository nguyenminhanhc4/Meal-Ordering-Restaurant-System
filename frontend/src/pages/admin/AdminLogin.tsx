import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Card } from "flowbite-react";
import api from "../../api/axios"; // axios instance
import { AxiosError } from "axios";
import { useNotification } from "../../components/Notification/NotificationContext";
import { useAuth } from "../../store/AuthContext";

function AdminLogin() {
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

      if (user?.role === "ADMIN") {
        notify("success", "Đăng nhập admin thành công!");
        navigate("/admin/dashboard");
      } else {
        notify("error", "Bạn không có quyền admin!");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        notify("error", err.response?.data.message || "Login failed!");
      } else {
        notify("error", "Unexpected error!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-6 shadow-2xl rounded-lg border-l-8 !border-blue-600 dark:!bg-gray-800 dark:!border-blue-700">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
          Admin Login
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label
              htmlFor="email"
              className="mb-1 block text-gray-700 dark:text-gray-300">
              Email
            </Label>
            <TextInput
              id="email"
              type="email"
              placeholder="admin@example.com"
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
              Mật khẩu
            </Label>
            <TextInput
              id="password"
              type="password"
              placeholder="********"
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
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AdminLogin;
