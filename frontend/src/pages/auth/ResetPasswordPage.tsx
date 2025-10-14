import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { AxiosError } from "axios";
import { useNotification } from "../../components/Notification/";

export default function ResetPasswordPage() {
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

    if (password.length < 8)
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    else if (!/[A-Z]/.test(password))
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ hoa";
    else if (!/[a-z]/.test(password))
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ thường";
    else if (!/[0-9]/.test(password))
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 số";
    else if (!/[!@#$%^&*()_+\-={}[\]|;:'",.<>/?]/.test(password))
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";

    if (password !== confirmPassword)
      newErrors.confirm = "Mật khẩu xác nhận không khớp";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      notify("error", "Token không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      notify("success", "Đổi mật khẩu thành công!");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        notify(
          "error",
          err.response?.data?.message || "Lỗi khi đặt lại mật khẩu"
        );
      } else {
        notify("error", "Đã xảy ra lỗi không xác định!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 flex items-center justify-center py-12 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-lg p-10 bg-white rounded-2xl shadow-xl relative">
        {/* Overlay loading */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-2xl z-10">
            <span className="text-blue-600 font-semibold text-lg">
              Đang xử lý...
            </span>
          </div>
        )}

        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Đặt lại mật khẩu
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-0">
          {/* Mật khẩu mới */}
          <div>
            <label className="block text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
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

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
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
            Đặt lại mật khẩu
          </button>
        </form>
      </div>
    </section>
  );
}
