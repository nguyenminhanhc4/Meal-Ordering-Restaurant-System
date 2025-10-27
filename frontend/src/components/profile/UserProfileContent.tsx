import { useAuth } from "../../store/AuthContext";
import { useMemo, useState, useEffect, type InputHTMLAttributes } from "react";
import api from "../../api/axios";
import { useNotification } from "../../components/Notification";
import { useTranslation } from "react-i18next";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        {...props}
        className={`w-full rounded-xl px-4 py-2.5 shadow-sm transition-all duration-200 outline-none
  border ${
    props.disabled
      ? "bg-gray-50 text-gray-700 border-gray-200 cursor-not-allowed"
      : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
  }`}
      />
    </div>
  );
}

export default function UserProfileContent() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { notify } = useNotification();

  const initialForm = useMemo(
    () => ({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      gender: user?.gender || "",
      email: user?.email || "",
    }),
    [user]
  );

  const [form, setForm] = useState(initialForm);

  useEffect(() => setForm(initialForm), [user]);

  if (!user) return <p className="p-8 text-center">{t("profile.loading")}</p>;

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
      notify("success", t("profile.notifications.updateSuccess"));
    } catch (err) {
      console.error(err);
      notify("error", t("profile.notifications.updateFail"));
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
      notify("success", t("profile.notifications.avatarUpdateSuccess"));
    } catch (err) {
      console.error(err);
      notify("error", t("profile.notifications.avatarUpdateFail"));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-blue-800">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 bg-gray-50 rounded-t-3xl border-b border-gray-100">
        <div className="relative flex-shrink-0">
          <label htmlFor="avatar-upload" className="cursor-pointer group block">
            <img
              src={preview || user.avatarUrl || "/default-avatar.png"}
              alt={t("profile.avatarAlt")}
              className="w-24 h-24 rounded-full object-cover border-4 border-white ring-2 ring-blue-500/50 group-hover:ring-blue-500 transition duration-300 shadow-lg"
            />
            <div className="absolute inset-0 w-24 h-24 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center text-white text-sm font-medium transition duration-300">
              {t("profile.changeAvatar")}
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

        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {user.name}
          </h2>
          <p className="text-md text-gray-500 mt-1">{user.email}</p>
        </div>
      </div>

      <div className="space-y-5 p-6 sm:p-8">
        <InputField
          label={t("profile.fields.name")}
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={!editing}
        />
        <InputField
          label={t("profile.fields.phone")}
          name="phone"
          value={form.phone}
          onChange={handleChange}
          disabled={!editing}
        />
        <InputField
          label={t("profile.fields.address")}
          name="address"
          value={form.address}
          onChange={handleChange}
          disabled={!editing}
        />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("profile.fields.gender")}
          </label>
          {editing ? (
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 appearance-none">
              <option value="" disabled>
                {t("profile.fields.genderPlaceholder")}
              </option>
              <option value="Male">{t("profile.gender.male")}</option>
              <option value="Female">{t("profile.gender.female")}</option>
            </select>
          ) : (
            <p className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 transition duration-150">
              {form.gender === "Male"
                ? t("profile.gender.male")
                : form.gender === "Female"
                ? t("profile.gender.female")
                : t("profile.gender.notUpdated")}
            </p>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 pt-4 flex justify-end gap-3 border-t border-gray-100 rounded-b-3xl">
        {editing ? (
          <>
            <button
              onClick={() => {
                setForm(initialForm);
                setEditing(false);
              }}
              className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition duration-150 shadow-sm">
              {t("profile.actions.cancel")}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition duration-150 shadow-md shadow-blue-500/30">
              {t("profile.actions.save")}
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition duration-150 shadow-md shadow-blue-500/30">
            {t("profile.actions.editProfile")}
          </button>
        )}
      </div>
    </div>
  );
}
