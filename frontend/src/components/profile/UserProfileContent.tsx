import { useAuth } from "../../store/AuthContext";
import { useState, useEffect, type InputHTMLAttributes } from "react";
import api from "../../api/axios";
import { useNotification } from "../../components/Notification";

// Định nghĩa InputField Props
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

// Giả định InputField được đặt trong cùng file hoặc import từ nơi khác
function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        {...props}
        // Áp dụng phong cách hiện đại (từ gợi ý trước) cho InputField
        className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 shadow-sm transition duration-150
        ${
          props.disabled
            ? "bg-gray-50 text-gray-700 cursor-not-allowed"
            : "bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`}
      />
    </div>
  );
}

export default function UserProfileContent() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { notify } = useNotification();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    gender: user?.gender || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        gender: user.gender || "",
        email: user.email || "",
      });
    }
  }, [user]);

  if (!user) return <p className="p-8 text-center">Đang tải thông tin...</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put(`/users/me`, form, { withCredentials: true });
      await refreshUser();
      setEditing(false);
      notify("success", "Cập nhật thông tin thành công!");
    } catch (err) {
      console.error(err);
      notify("error", "Cập nhật thông tin thất bại.");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.publicId) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await api.post(`/users/${user.publicId}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      await refreshUser();
      notify("success", "Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      console.error(err);
      notify("error", "Không thể cập nhật ảnh đại diện.");
    }
  };

  return (
    // Component này là nội dung chính, được bọc trong container shadow của layout
    <div className="bg-white rounded-3xl shadow-2xl border border-blue-800">
      {/* --- Phần Thông tin Cơ bản (Header) --- */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 bg-gray-50 rounded-t-3xl border-b border-gray-100">
        {/* Khu vực Avatar - Rõ ràng, trực quan hơn */}
        <div className="relative flex-shrink-0">
          <label htmlFor="avatar-upload" className="cursor-pointer group block">
            <img
              src={preview || user.avatarUrl || "/default-avatar.png"}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white ring-2 ring-blue-500/50 group-hover:ring-blue-500 transition duration-300 shadow-lg"
            />
            {/* Lớp phủ thay đổi Avatar - hiện đại hơn */}
            <div className="absolute inset-0 w-24 h-24 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center text-white text-sm font-medium transition duration-300">
              Thay đổi
            </div>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Tên và Email */}
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {user.name}
          </h2>
          <p className="text-md text-gray-500 mt-1">{user.email}</p>
        </div>
      </div>

      {/* --- Phần Các Trường Thông Tin Chi Tiết --- */}
      <div className="space-y-5 p-6 sm:p-8">
        <InputField
          label="Tên"
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={!editing}
        />
        <InputField
          label="Số điện thoại"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          disabled={!editing}
        />
        <InputField
          label="Địa chỉ"
          name="address"
          value={form.address}
          onChange={handleChange}
          disabled={!editing}
        />

        {/* ✅ Giới tính */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Giới tính
          </label>
          {editing ? (
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 appearance-none">
              <option value="" disabled>
                -- Chọn giới tính --
              </option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          ) : (
            <p className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 transition duration-150">
              {form.gender === "Male"
                ? "Nam"
                : form.gender === "Female"
                ? "Nữ"
                : "Chưa cập nhật"}
            </p>
          )}
        </div>
      </div>

      {/* --- Nút Hành Động (Action Buttons) --- */}
      <div className="p-6 sm:p-8 pt-4 flex justify-end gap-3 border-t border-gray-100 rounded-b-3xl">
        {editing ? (
          <>
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition duration-150 shadow-sm">
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition duration-150 shadow-md shadow-blue-500/30">
              Lưu thay đổi
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition duration-150 shadow-md shadow-blue-500/30">
            Chỉnh sửa hồ sơ
          </button>
        )}
      </div>
    </div>
  );
}
