import React, { useState } from "react";
import api from "../../api/axios";
import axios from "axios";
import { useNotification } from "../Notification";

export default function UserSecuritySettings() {
  const { notify } = useNotification();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // xóa lỗi khi người dùng nhập lại
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // ✅ Mật khẩu hiện tại
    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    // ✅ Mật khẩu mới
    if (form.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
    } else if (!/[A-Z]/.test(form.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải chứa ít nhất 1 chữ hoa";
    } else if (!/[a-z]/.test(form.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải chứa ít nhất 1 chữ thường";
    } else if (!/[0-9]/.test(form.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải chứa ít nhất 1 chữ số";
    } else if (!/[!@#$%^&*()_+\-={}[\]|;:'",.<>/?]/.test(form.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt";
    }

    // ✅ Mật khẩu xác nhận
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
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
      notify("success", "Đổi mật khẩu thành công!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        notify("error", err.message);
      } else if (axios.isAxiosError(err)) {
        if (axios.isAxiosError(err)) {
          notify(
            "error",
            err.response?.data?.message || "Lỗi khi đổi mật khẩu!"
          );
        } else {
          notify("error", "Đã xảy ra lỗi không xác định!");
        }
      } else {
        notify("error", "Đã xảy ra lỗi không xác định!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-2xl border border-blue-800">
      <h2 className="text-xl font-semibold text-blue-700 mb-6">
        Bảo mật & Đổi mật khẩu
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* Mật khẩu hiện tại */}
        <div>
          <label className="block text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className={`w-full p-3 border rounded-xl focus:ring-2 ${
              errors.currentPassword
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-blue-500"
            }`}
          />
          {errors.currentPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.currentPassword}
            </p>
          )}
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="block text-gray-700 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className={`w-full p-3 border rounded-xl focus:ring-2 ${
              errors.newPassword
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-blue-500"
            }`}
          />
          {errors.newPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
          )}
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div>
          <label className="block text-gray-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`w-full p-3 border rounded-xl focus:ring-2 ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-blue-500"
            }`}
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
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
          {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}
