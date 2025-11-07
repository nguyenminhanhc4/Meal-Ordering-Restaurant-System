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
import { useNotification } from "../../Notification";
import axios from "../../../api/axios";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";

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
    role?: { id: number; name: string };
    status?: { id: number; name: string };
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
  const { t } = useTranslation(); // <-- i18n hook
  const { notify } = useNotification();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    statusId: "",
    avatar: null,
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
      notify("error", t("admin.users.form.notifications.fileTooLarge"));
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      notify("error", t("admin.users.form.notifications.invalidFileType"));
      return false;
    }

    return true;
  };

  const fetchParams = useCallback(async (type: string, signal: AbortSignal) => {
    try {
      const response = await axios.get(`/params?type=${type}`, { signal });
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!show || (roles.length > 0 && statuses.length > 0)) return;

    const abortController = new AbortController();
    let mounted = true;

    const loadData = async () => {
      try {
        const [fetchedRoles, fetchedStatuses] = await Promise.all([
          fetchParams("ROLE", abortController.signal),
          fetchParams("STATUS", abortController.signal),
        ]);

        if (mounted && !abortController.signal.aborted) {
          if (fetchedRoles.length > 0) setRoles(fetchedRoles);
          if (fetchedStatuses.length > 0) setStatuses(fetchedStatuses);
        }
      } catch (error: unknown) {
        if (mounted && !abortController.signal.aborted) {
          if (isAxiosError(error)) {
            // Lỗi từ Axios (mạng, server, 500, 404, v.v.)
            const msg = error.response?.data?.message ?? error.message;
            notify(
              "error",
              t("admin.users.form.notifications.loadFailed", { error: msg })
            );
          } else if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            // Lỗi do hủy request (người dùng thoát trang)
            console.log("Request bị hủy do component unmount");
            // → Không notify, vì người dùng không cần biết
          } else {
            // Lỗi khác (rất hiếm)
            notify(
              "error",
              t("admin.users.form.notifications.loadFailed", {
                error: "Lỗi không xác định",
              })
            );
          }
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [show, roles.length, statuses.length, fetchParams, notify, t]);

  useEffect(() => {
    if (userData) {
      const newFormData: FormData = {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        password: "",
        roleId: String(userData.roleId || userData.role?.id || ""),
        statusId: String(userData.statusId || userData.status?.id || ""),
        avatar: null,
      };
      setFormData(newFormData);
      setPreviewUrl(userData.avatarUrl || null);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        roleId: "",
        statusId: "",
        avatar: null,
      });
      setPreviewUrl(null);
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      notify("error", t("admin.users.form.notifications.invalidEmail"));
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      notify("error", t("admin.users.form.notifications.invalidPhone"));
      return;
    }

    if (!userData && !validatePassword(formData.password)) {
      notify("error", t("admin.users.form.notifications.passwordTooShort"));
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

      if (formData.avatar instanceof File) {
        if (!validateFile(formData.avatar)) return;

        setUploadLoading(true);
        try {
          const formDataWithFile = new FormData();
          formDataWithFile.append("avatar", formData.avatar);

          const endpoint = userData
            ? `/users/${userData.publicId}/avatar`
            : "/users/upload";

          const uploadResponse = await axios.post(endpoint, formDataWithFile, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (!uploadResponse.data.avatarUrl) {
            throw new Error("No URL returned from upload");
          }

          avatarUrl = uploadResponse.data.avatarUrl;
        } catch (error) {
          const err = error as Error;
          notify(
            "error",
            t("admin.users.form.notifications.uploadFailed", {
              error: err.message,
            })
          );
          return;
        } finally {
          setUploadLoading(false);
        }
      }

      const userPayload = {
        ...payload,
        avatarUrl: avatarUrl || userData?.avatarUrl,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { avatar: _, ...finalPayload } = userPayload;

      if (userData) {
        await axios.put(`/users/${userData.publicId}`, finalPayload);
        notify("success", t("admin.users.form.notifications.updateSuccess"));
      } else {
        await axios.post("/users", finalPayload);
        notify("success", t("admin.users.form.notifications.createSuccess"));
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const msg =
          error.response?.data?.message ??
          t("admin.users.form.notifications.saveFailed");
        notify("error", msg);
      } else {
        notify("error", t("admin.users.form.notifications.saveFailed"));
      }
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

      if (!file) {
        setPreviewUrl(null);
        setFormData((prev) => ({ ...prev, avatar: null }));
        return;
      }

      if (!validateFile(file)) {
        fileInput.value = "";
        setPreviewUrl(null);
        setFormData((prev) => ({ ...prev, avatar: null }));
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      setFormData((prev) => ({ ...prev, avatar: file }));

      return () => URL.revokeObjectURL(fileUrl);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="4xl"
      className="shadow-lg z-[70]">
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          {userData
            ? t("admin.users.form.headerEdit")
            : t("admin.users.form.headerCreate")}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <ModalBody className="p-6 space-y-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.users.form.nameLabel")}
                </Label>
                <TextInput
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("admin.users.form.namePlaceholder")}
                  theme={{
                    field: {
                      input: {
                        base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.users.form.emailLabel")}
                </Label>
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("admin.users.form.emailPlaceholder")}
                  theme={{
                    field: {
                      input: {
                        base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.users.form.phoneLabel")}
                </Label>
                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("admin.users.form.phonePlaceholder")}
                  theme={{
                    field: {
                      input: {
                        base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}
                />
              </div>

              {!userData && (
                <div>
                  <Label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium !text-gray-700">
                    {t("admin.users.form.passwordLabel")}
                  </Label>
                  <TextInput
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("admin.users.form.passwordPlaceholder")}
                    theme={{
                      field: {
                        input: {
                          base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="roleId"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.users.form.roleLabel")}
                </Label>
                <Select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  theme={{
                    field: {
                      select: {
                        base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}>
                  <option value="">
                    {t("admin.users.form.rolePlaceholder")}
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.code}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="statusId"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.users.form.statusLabel")}
                </Label>
                <Select
                  id="statusId"
                  name="statusId"
                  value={formData.statusId}
                  onChange={handleChange}
                  theme={{
                    field: {
                      select: {
                        base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}>
                  <option value="">
                    {t("admin.users.form.statusPlaceholder")}
                  </option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.code}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="avatar"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.users.form.avatarLabel")}
                </Label>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={
                        previewUrl ||
                        userData?.avatarUrl ||
                        "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                      }
                      alt="Avatar preview"
                      className="w-full h-full rounded-full object-cover border-2 border-cyan-400"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <TextInput
                      id="avatar"
                      name="avatar"
                      type="file"
                      onChange={handleChange}
                      accept="image/jpeg,image/png,image/gif"
                      disabled={uploadLoading}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                      theme={{
                        field: {
                          input: {
                            base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                          },
                        },
                      }}
                    />

                    {uploadLoading && (
                      <p className="flex items-center gap-2 mt-1 text-sm text-cyan-600">
                        <Spinner size="sm" /> {t("admin.users.form.uploading")}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {t("admin.users.form.avatarHint")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="p-4 border-t bg-gray-50 border-gray-200 flex justify-end space-x-2">
          <Button color="red" onClick={onClose}>
            {t("admin.users.form.cancelButton")}
          </Button>
          <Button
            type="submit"
            disabled={loading || uploadLoading}
            className="bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 text-white disabled:bg-cyan-400">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light={true} />
                {t("admin.users.form.saving")}
              </div>
            ) : (
              t("admin.users.form.saveButton")
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
