import { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import api from "../../api/axios";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email.";
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Gọi API login
        const response = await api.post(
          "/auth/login",
          { email, password },
          { withCredentials: true } // quan trọng nếu backend trả HTTP-only cookie
        );

        console.log("Login success:", response.data);

        // Redirect sang dashboard hoặc trang chính
        navigate("/dashboard");
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Login failed:", error.response?.data);
        } else {
          console.error("Unexpected error:", error);
        }
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
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-stone-700 text-white border-stone-600"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="text-gray-100">
            Password
          </Label>
          <TextInput
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-stone-700 text-white border-stone-600"
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:opacity-90"
          fullSized>
          Login
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
