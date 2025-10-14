import { useState } from "react";
import { Spinner, Button, Label, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { AxiosError } from "axios";
import api from "../../api/axios";
import { useAuth } from "../../store/AuthContext";
import { useNotification } from "../../components/Notification/NotificationContext";

export default function LoginForm() {
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
      newErrors.email = "Invalid email format.";
    }

    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email.";
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        // Gọi API login
        const response = await api.post(
          "/auth/login",
          { email, password },
          { withCredentials: true } // quan trọng nếu backend trả HTTP-only cookie
        );

        console.log("Login success:", response.data);

        // Redirect sang dashboard hoặc trang chính
        navigate("/");
        notify("success", "Đăng nhập thành công!");
        await refreshUser();
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          notify("error", "Đăng nhập thất bại. Vui lòng đăng nhập lại.");
        } else {
          notify("error", "An unexpected error occurred. Please try again.");
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
      notify("error", "Vui lòng nhập email của bạn.");
      return;
    }

    try {
      setForgotLoading(true);
      // Gọi API gửi yêu cầu đặt lại mật khẩu
      await api.post("/auth/forgot-password", { email: forgotEmail });

      // Luôn thông báo success giống nhau, không tiết lộ email có tồn tại hay không
      notify(
        "success",
        "Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn."
      );

      setForgotEmail("");
      setShowForgotModal(false); // đóng modal
    } catch (error: unknown) {
      console.error("Forgot password error:", error);

      // Chỉ thông báo lỗi nếu có sự cố kỹ thuật thực sự (network/server)
      notify(
        "error",
        "Không thể gửi yêu cầu vào lúc này. Vui lòng thử lại sau."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        Đăng nhập
      </h2>
      <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <Label htmlFor="email" className="!text-gray-100">
            Email
          </Label>
          <TextInput
            id="email"
            type="text"
            placeholder="Enter your email"
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
            Mật khẩu
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
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:opacity-90"
          disabled={loading}
          fullSized>
          {loading && <Spinner size="sm" light={true} />}
          {loading ? "Đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      {/* Switch to Register */}
      <p className="text-sm text-gray-300 text-center mt-6">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="text-yellow-300 hover:text-yellow-400">
          Đăng ký mới
        </Link>
      </p>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-stone-800 rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Quên mật khẩu</h3>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Nhập email của bạn"
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
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="py-2 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                  {forgotLoading ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
