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
        notify("success", "Login successful!");
        await refreshUser();
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          notify(
            "error",
            error.response?.data.message || "Login failed. Please try again."
          );
          console.error("Login failed:", error.response?.data);
        } else {
          notify("error", "An unexpected error occurred. Please try again.");
          console.error("Unexpected error:", error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">Login</h2>
      <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-gray-100">
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
            className="bg-stone-700 text-white border-stone-600"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <Label htmlFor="password" className="text-gray-100">
            Password
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
            className="bg-stone-700 text-white border-stone-600"
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

        {/* Submit */}
        <Button
          type="submit"
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:opacity-90"
          disabled={loading}
          fullSized>
          {loading && <Spinner size="sm" light={true} />}
          {loading ? "Login..." : "Login"}
        </Button>
      </form>

      {/* Switch to Register */}
      <p className="text-sm text-gray-300 text-center mt-6">
        Don’t have an account?{" "}
        <Link to="/register" className="text-yellow-300 hover:text-yellow-400">
          Register
        </Link>
      </p>
    </div>
  );
}
