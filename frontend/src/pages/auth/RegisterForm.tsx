import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Button, Label, TextInput, Radio } from "flowbite-react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import api from "../../api/axios";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useNotification } from "../../components/Notification/NotificationContext";

export default function RegisterForm() {
  // State cho các input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("6");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  const navigate = useNavigate();
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    // validation
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (confirmPassword !== password) {
      newErrors.confirm = "Passwords do not match.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format.";
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
        notify("success", "Register successful! Please login.");
        navigate("/login");
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Register failed:", error.response?.data);
          notify("error", error.response?.data?.message || "Register failed.");
        } else {
          console.error("Unexpected error:", error);
          notify("error", "Unexpected error occurred.");
        }
      } finally {
        setLoading(false); // tắt loading
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        Register
      </h2>
      <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div>
          <Label htmlFor="name" className="text-gray-100">
            Full Name
          </Label>
          <TextInput
            id="name"
            type="text"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-stone-700 text-white border-stone-600"
          />
        </div>

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

        {/* Confirm Password */}
        <div className="relative">
          <Label htmlFor="confirmPassword" className="text-gray-100">
            Confirm Password
          </Label>
          <TextInput
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            maxLength={20}
            color={errors.password ? "failure" : "gray"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-stone-700 text-white border-stone-600"
          />
          <button
            type="button"
            className="absolute inset-y-11 right-0 flex items-center pr-3 text-gray-300 hover:text-white"
            onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
          </button>
          {errors.confirm && (
            <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <Label className="text-gray-100 mb-2">Gender</Label>
          <div className="flex gap-6 mt-2">
            <div className="flex items-center gap-2">
              <Radio
                id="male"
                name="gender"
                value="male"
                checked={gender === "MALE"}
                onChange={() => setGender("MALE")}
              />
              <Label htmlFor="male" className="text-gray-200">
                Male
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Radio
                id="female"
                name="gender"
                value="female"
                checked={gender === "FEMALE"}
                onChange={() => setGender("FEMALE")}
              />
              <Label htmlFor="female" className="text-gray-200">
                Female
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
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>

      <p className="text-sm text-gray-300 text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-yellow-300 hover:text-yellow-400">
          Login
        </Link>
      </p>
    </div>
  );
}
