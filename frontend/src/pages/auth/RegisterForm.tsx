import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Spinner, Button, Label, TextInput, Radio } from "flowbite-react";
import { AxiosError } from "axios";
import api from "../../api/axios";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useNotification } from "../../components/Notification/NotificationContext";
import { useTranslation } from "react-i18next";

export default function RegisterForm() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("6");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  const navigate = useNavigate();
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = t("auth.register.error.requiredName");
    }

    // ===== Email validation =====
    if (!email.trim()) {
      newErrors.email = t("auth.register.error.requiredEmail");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("auth.register.error.invalidEmailFormat");
    }

    // ===== Password validation =====
    if (!password.trim()) {
      newErrors.password = t("auth.register.error.requiredPassword");
    } else {
      if (password.length < 8) {
        newErrors.password = t("auth.register.error.shortPassword");
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = t("auth.register.error.uppercaseRequired");
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = t("auth.register.error.numberRequired");
      } else if (!/[!@#$%^&*]/.test(password)) {
        newErrors.password = t("auth.register.error.specialCharRequired");
      }
    }

    // ===== Confirm password =====
    if (!confirmPassword.trim()) {
      newErrors.confirm = t("auth.register.error.confirmPassword");
    } else if (confirmPassword !== password) {
      newErrors.confirm = t("auth.register.error.passwordMismatch");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const response = await api.post("/auth/register", {
          name,
          email,
          password,
          gender,
        });
        console.log("Register success:", response.data);
        notify("success", t("auth.register.success"));
        navigate("/login");
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Register failed:", error.response?.data);
          if (error.response?.data?.message === "Invalid email or password") {
            setErrors({
              email: t("auth.register.error.invalidCredentials"),
              password: t("auth.register.error.invalidCredentials"),
            });
          } else {
            notify(
              "error",
              error.response?.data?.message || t("auth.register.failure")
            );
            setErrors({ email: error.response?.data?.message });
          }
        } else {
          console.error("Unexpected error:", error);
          notify("error", t("auth.common.unexpectedError"));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        {t("auth.register.title")}
      </h2>

      <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div>
          <Label htmlFor="name" className="text-gray-100">
            {t("auth.register.fullName")}
          </Label>
          <TextInput
            id="name"
            type="text"
            color={errors.email ? "failure" : "gray"}
            placeholder={t("auth.register.fullNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            theme={{
              field: {
                input: {
                  base: "!bg-stone-700 !text-white !border-stone-600",
                },
              },
            }}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="!text-gray-100">
            {t("auth.register.email")}
          </Label>
          <TextInput
            id="email"
            type="text"
            placeholder={t("auth.register.emailPlaceholder")}
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
            {t("auth.register.password")}
          </Label>
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.register.passwordPlaceholder")}
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
            className="absolute inset-y-11 right-0 flex items-center pr-3 text-gray-300 hover:text-white"
            onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Label htmlFor="confirmPassword" className="!text-gray-100">
            {t("auth.register.confirmPassword")}
          </Label>
          <TextInput
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.register.confirmPasswordPlaceholder")}
            maxLength={20}
            color={errors.confirm ? "failure" : "gray"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            theme={{
              field: {
                input: {
                  base: "!bg-stone-700 !text-white !border-stone-600",
                },
              },
            }}
          />
          {errors.confirm && (
            <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>
          )}
          <button
            type="button"
            className="absolute inset-y-11 right-0 flex items-center pr-3 text-gray-300 hover:text-white"
            onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
          </button>
        </div>

        {/* Gender */}
        <div>
          <Label className="!text-gray-100 mb-2">
            {t("auth.register.gender")}
          </Label>
          <div className="flex gap-6 mt-2">
            <div className="flex items-center gap-2">
              <Radio
                id="male"
                name="gender"
                value="male"
                checked={gender === "MALE"}
                onChange={() => setGender("MALE")}
                className="!bg-stone-700 !border-stone-600"
              />
              <Label htmlFor="male" className="!text-gray-200">
                {t("auth.register.male")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Radio
                id="female"
                name="gender"
                value="female"
                checked={gender === "FEMALE"}
                onChange={() => setGender("FEMALE")}
                className="!bg-stone-700 !border-stone-600"
              />
              <Label htmlFor="female" className="!text-gray-200">
                {t("auth.register.female")}
              </Label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:opacity-90"
          disabled={loading}
          fullSized>
          {loading && <Spinner size="sm" light={true} />}
          {loading ? t("auth.register.loading") : t("auth.register.submit")}
        </Button>
      </form>

      <p className="text-sm text-gray-300 text-center mt-6">
        {t("auth.register.haveAccount")}{" "}
        <Link to="/login" className="text-yellow-300 hover:text-yellow-400">
          {t("auth.register.loginLink")}
        </Link>
      </p>
    </div>
  );
}
