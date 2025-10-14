import React, { useState } from "react";
import api from "../../api/axios";
import axios from "axios";
import { useNotification } from "../Notification";

// Component nội dung Quên mật khẩu (cập nhật để cân đối layout)
const ForgotPasswordContent = ({
  notify,
}: {
  notify: (type: "success" | "error", message: string) => void;
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      notify("error", "Vui lòng nhập email của bạn.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email }); // gọi API thật
      notify(
        "success",
        "Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn."
      );

      setEmail("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify("error", "Không thể gửi yêu cầu, vui lòng thử lại.");
      } else {
        notify("error", "Đã xảy ra lỗi không xác định!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Bỏ max-w-md để nó tự lấp đầy container
    <form
      onSubmit={handleForgotPasswordSubmit}
      className="space-y-4 pt-4 w-full md:w-3/4 lg:w-2/3 xl:w-1/2">
      <h3 className="text-lg font-semibold text-gray-800">
        Yêu cầu đặt lại mật khẩu
      </h3>
      <p className="text-sm text-gray-600">
        Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
      </p>
      <div>
        <label className="block text-gray-700 mb-1" htmlFor="email">
          Email đăng ký
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          required
          className="w-full p-3 border placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50">
        {loading ? "Đang gửi..." : "Gửi yêu cầu đặt lại mật khẩu"}
      </button>
    </form>
  );
};

export default function UserSecuritySettings() {
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
    // ... (Giữ nguyên logic validateForm) ...
    const newErrors: { [key: string]: string } = {};
    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
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
      if (axios.isAxiosError(err)) {
        notify("error", err.response?.data?.message || "Lỗi khi đổi mật khẩu!");
      } else {
        notify("error", "Đã xảy ra lỗi không xác định!");
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
    // Giữ nguyên container
    <div className="p-8 bg-white rounded-3xl shadow-2xl border border-blue-800">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 border-b pb-3">
        Cài đặt Bảo mật
      </h2>

      {/* --- Cấu trúc Tabs --- */}
      <div className="text-sm font-medium text-center text-gray-500 mb-6">
        <ul className="flex -mb-4">
          <li className="flex-1">
            <a
              onClick={() => setActiveTab("changePassword")}
              className={tabClass("changePassword")}>
              Đổi mật khẩu
            </a>
          </li>
          <li className="flex-1">
            <a
              onClick={() => setActiveTab("forgotPassword")}
              className={tabClass("forgotPassword")}>
              Quên mật khẩu
            </a>
          </li>
        </ul>
        <div className="border-b-2 border-gray-200"></div>
      </div>

      {/* --- Nội dung Tabs được căn chỉnh lại --- */}
      <div className="tab-content pt-4 flex justify-center">
        {" "}
        {/* Thêm flex justify-center để căn giữa form */}
        {activeTab === "changePassword" && (
          // Bỏ max-w-md và thay bằng giới hạn cho form đổi mật khẩu
          <form
            onSubmit={handleSubmit}
            className="space-y-4 w-full md:w-3/4 lg:w-2/3 xl:w-1/2" // Đặt giới hạn cân đối
          >
            {/* Tiêu đề cho form đổi mật khẩu */}
            <h3 className="text-lg font-semibold text-gray-800">
              Thay đổi mật khẩu tài khoản
            </h3>
            {/* Mật khẩu hiện tại */}
            <div>
              <label className="block text-gray-700 mb-1">
                Mật khẩu hiện tại
              </label>
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
                <p className="text-sm text-red-500 mt-1">
                  {errors.newPassword}
                </p>
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
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </button>
          </form>
        )}
        {activeTab === "forgotPassword" && (
          // Truyền hàm notify vào component Quên mật khẩu
          <ForgotPasswordContent notify={notify} />
        )}
      </div>
    </div>
  );
}
