import {
  Modal,
  Button,
  Label,
  TextInput,
  Select,
  Spinner,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import React, { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../components/Notification";
import axios from "../../api/axios";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  statusId: string;
  avatar: File | null;
}

interface UserFormModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userData?: {
    publicId: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    roleId?: number;
    statusId?: number;
    role?: {
      id: number;
      name: string;
    };
    status?: {
      id: number;
      name: string;
    };
  };
}

interface RoleOption {
  id: number;
  code: string;
  name: string;
}

interface StatusOption {
  id: number;
  code: string;
  name: string;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  show,
  onClose,
  onSuccess,
  userData,
}): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    statusId: "",
    avatar: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return phone === "" || /^[0-9]{10,11}$/.test(phone);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file.size > maxSize) {
      notify("error", "File size must be less than 5MB");
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      notify("error", "Only JPG, PNG and GIF files are allowed");
      return false;
    }

    return true;
  };
  const { notify } = useNotification();

  // Memoize the fetch function to prevent recreating it on every render
  const fetchParams = useCallback(async (type: string, signal: AbortSignal) => {
    try {
      try {
        const response = await axios.get(`/params?type=${type}`, { signal });
        return response.data.data || [];
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${type} params:`, error);
      return [];
    }
  }, []);

  // Load roles and statuses with memoized data
  useEffect(() => {
    // Only fetch if modal is shown and we don't have data
    if (!show || (roles.length > 0 && statuses.length > 0)) {
      return;
    }

    const abortController = new AbortController();
    let mounted = true;

    const loadData = async () => {
      try {
        const [fetchedRoles, fetchedStatuses] = await Promise.all([
          fetchParams("ROLE", abortController.signal),
          fetchParams("STATUS", abortController.signal),
        ]);

        // Only update state if component is still mounted and request wasn't aborted
        if (mounted && !abortController.signal.aborted) {
          if (fetchedRoles.length > 0) setRoles(fetchedRoles);
          if (fetchedStatuses.length > 0) setStatuses(fetchedStatuses);
        }
      } catch (error) {
        if (mounted && !abortController.signal.aborted) {
          console.error("Failed to load form options:", error);
          notify("error", "Failed to load form options");
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [show, roles.length, statuses.length, fetchParams, notify]);

  // Set form data when editing or resetting
  useEffect(() => {
    if (userData) {
      // Edit mode: Load user data
      console.log("Loading user data for edit:", userData);
      const newFormData: FormData = {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        password: "", // Don't set password when editing
        roleId: String(userData.roleId || userData.role?.id || ""),
        statusId: String(userData.statusId || userData.status?.id || ""),
        avatar: null,
      };
      setFormData(newFormData);
    } else {
      // Add mode: Reset form
      const defaultFormData: FormData = {
        name: "",
        email: "",
        phone: "",
        password: "",
        roleId: "",
        statusId: "",
        avatar: null,
      };
      setFormData(defaultFormData);
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!validateEmail(formData.email)) {
      notify("error", "Please enter a valid email address");
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      notify("error", "Please enter a valid phone number");
      return;
    }

    if (!userData && !validatePassword(formData.password)) {
      notify("error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        roleId: parseInt(formData.roleId),
        statusId: parseInt(formData.statusId),
      };

      let avatarUrl: string | undefined;

      // Handle file upload first if there's an avatar
      if (formData.avatar instanceof File) {
        if (!validateFile(formData.avatar)) {
          return;
        }

        setUploadLoading(true);

        try {
          // Create FormData instance
          const formDataWithFile = new FormData();
          formDataWithFile.append("avatar", formData.avatar);

          console.log("Uploading file:", {
            name: formData.avatar.name,
            type: formData.avatar.type,
            size: formData.avatar.size,
          });

          if (userData) {
            // Update existing user's avatar
            const avatarResponse = await axios.post(
              `/users/${userData.publicId}/avatar`,
              formDataWithFile,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            if (!avatarResponse.data.data?.url) {
              throw new Error("No URL returned from upload");
            }

            avatarUrl = avatarResponse.data.data.url;
            console.log("Avatar update response:", avatarResponse.data);
          } else {
            // For new user, upload avatar first
            const uploadResponse = await axios.post(
              "/users/upload",
              formDataWithFile,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            if (!uploadResponse.data.data?.url) {
              throw new Error("No URL returned from upload");
            }

            avatarUrl = uploadResponse.data.data.url;
            console.log("Avatar upload response:", uploadResponse.data);
          }
        } catch (error) {
          const err = error as Error & { response?: { data: unknown } };
          console.error("Error uploading avatar:", {
            message: err.message,
            response: err.response?.data,
          });
          notify("error", `Failed to upload avatar: ${err.message}`);
          return;
        } finally {
          setUploadLoading(false);
        }
      }

      // Create final payload without the avatar file
      const userPayload = {
        ...payload,
        avatarUrl: avatarUrl || userData?.avatarUrl, // Use new URL or keep existing
      };

      // Remove avatar property from payload
      // Destructure to remove avatar as it's already handled
      const { avatar: _, ...finalPayload } = userPayload; // eslint-disable-line @typescript-eslint/no-unused-vars

      if (userData) {
        // Update existing user
        await axios.put(`/users/${userData.publicId}`, finalPayload);
        notify("success", "User updated successfully");
      } else {
        // Create new user
        await axios.post("/users", finalPayload);
        notify("success", "User created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save user:", error);
      notify("error", `Failed to ${userData ? "update" : "create"} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;

      // Clear preview if no file selected
      if (!file) {
        setPreviewUrl(null);
        setFormData((prev) => ({
          ...prev,
          avatar: null,
        }));
        return;
      }

      // Validate file before setting
      if (!validateFile(file)) {
        fileInput.value = ""; // Reset file input
        setPreviewUrl(null);
        setFormData((prev) => ({
          ...prev,
          avatar: null,
        }));
        return;
      }

      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      // Set file in form data
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));

      // Clean up old preview URL
      return () => {
        if (fileUrl) {
          URL.revokeObjectURL(fileUrl);
        }
      };
    } else {
      // Validate other fields
      if (name === "email" && !validateEmail(value)) {
        // Don't block input but show warning
        console.warn("Invalid email format");
      }

      if (name === "phone" && value && !validatePhone(value)) {
        // Don't block input but show warning
        console.warn("Invalid phone format");
      }

      if (name === "password" && value && !validatePassword(value)) {
        // Don't block input but show warning
        console.warn("Password too short");
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    // 1. Dùng size lớn hơn một chút nếu muốn thêm không gian (optional: size="lg")
    <Modal show={show} onClose={onClose} size="lg">
      {/* 2. Dùng Modal.Header */}
      <ModalHeader>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {userData ? "Edit User" : "Add New User"}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* 3. Dùng Modal.Body và tối ưu layout input */}
        <ModalBody className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Cột 1: Name, Email, Phone, Password */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-1 block font-medium">
                  Name
                </Label>
                <TextInput
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-1 block font-medium">
                  Email
                </Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-1 block font-medium">
                  Phone
                </Label>
                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+84 901 234 567"
                />
              </div>

              {!userData && (
                <div>
                  <Label htmlFor="password" className="mb-1 block font-medium">
                    Password
                  </Label>
                  <TextInput
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!userData}
                    placeholder="Enter a secure password"
                  />
                </div>
              )}
            </div>

            {/* Cột 2: Role, Status, Avatar */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleId" className="mb-1 block font-medium">
                  Role
                </Label>
                <Select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  required>
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="statusId" className="mb-1 block font-medium">
                  Status
                </Label>
                <Select
                  id="statusId"
                  name="statusId"
                  value={formData.statusId}
                  onChange={handleChange}
                  required>
                  <option value="">Select status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Avatar Section Optimization */}
              <div>
                <Label htmlFor="avatar" className="mb-1 block font-medium">
                  Avatar Image
                </Label>
                <div className="flex items-start gap-4">
                  {/* Avatar Preview */}
                  <div className="w-14 h-14 flex-shrink-0">
                    <img
                      src={
                        previewUrl ||
                        userData?.avatarUrl ||
                        "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                      } // Thêm ảnh placeholder mặc định
                      alt="Avatar preview"
                      className="w-full h-full rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* File Input and Status */}
                  <div className="flex-1 space-y-1">
                    <TextInput
                      id="avatar"
                      name="avatar"
                      type="file"
                      onChange={handleChange}
                      accept="image/jpeg,image/png,image/gif"
                      // Tùy chỉnh className cho input file (Tailwind)
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                      disabled={uploadLoading}
                    />

                    {uploadLoading && (
                      <p className="flex items-center gap-2 mt-1 text-sm text-blue-500 dark:text-blue-400">
                        <Spinner size="sm" /> Uploading avatar...
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Max size: 5MB. Formats: JPG, PNG, GIF.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        {/* 4. Dùng Modal.Footer */}
        <ModalFooter className="flex justify-end space-x-2">
          <Button
            color="gray"
            onClick={onClose}
            className="border border-gray-300">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploadLoading} // Vô hiệu hóa khi đang tải file
            className="bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-600">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light={true} />
                Saving...
              </div>
            ) : userData ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
