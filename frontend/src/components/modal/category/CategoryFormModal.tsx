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
  Textarea,
} from "flowbite-react";
import React, { useState, useEffect, useCallback } from "react";
import { useNotification } from "../../Notification";
import api from "../../../api/axios";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
}

interface CategoryFormModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryData?: {
    id: number;
    name: string;
    description: string;
    parentId?: number;
  };
}

interface ParentCategoryOption {
  id: number;
  name: string;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  show,
  onClose,
  onSuccess,
  categoryData,
}) => {
  const { t } = useTranslation();
  const { notify } = useNotification();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    parentId: "",
  });

  const [parentCategories, setParentCategories] = useState<
    ParentCategoryOption[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});

  const isEditMode = !!categoryData;

  // Reset form khi mở modal hoặc thay đổi categoryData
  useEffect(() => {
    if (show) {
      if (categoryData) {
        setFormData({
          name: categoryData.name || "",
          description: categoryData.description || "",
          parentId: categoryData.parentId?.toString() || "",
        });
      } else {
        setFormData({ name: "", description: "", parentId: "" });
      }
      setErrors({});
    }
  }, [categoryData, show]);

  // Load danh mục cha
  const loadParentCategories = useCallback(async () => {
    try {
      const response = await api.get<ParentCategoryOption[]>("/categories");
      let categories = response.data || [];
      if (categoryData) {
        categories = categories.filter((cat) => cat.id !== categoryData.id);
      }
      setParentCategories(categories);
    } catch (error) {
      console.error("Error loading parent categories:", error);
      notify(
        "error",
        t("admin.categories.form.notifications.loadParentsError")
      );
    }
  }, [categoryData, notify, t]);

  useEffect(() => {
    if (show) {
      void loadParentCategories();
    }
  }, [show, loadParentCategories]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CategoryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("admin.categories.form.validation.nameRequired");
    }
    if (!formData.description.trim()) {
      newErrors.description = t(
        "admin.categories.form.validation.descriptionRequired"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
      };

      if (isEditMode && categoryData) {
        await api.put(`/categories/${categoryData.id}`, payload);
        notify(
          "success",
          t("admin.categories.form.notifications.updateSuccess")
        );
      } else {
        await api.post("/categories", payload);
        notify(
          "success",
          t("admin.categories.form.notifications.createSuccess")
        );
      }

      onSuccess();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      const msg = err.response?.data?.message || err.message || "Unknown error";
      const key = isEditMode
        ? "admin.categories.form.notifications.updateError"
        : "admin.categories.form.notifications.createError";
      notify("error", t(key, { error: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "", description: "", parentId: "" });
      setErrors({});
      onClose();
    }
  };

  const getParentName = (id: string) => {
    if (!id) return t("admin.categories.form.previewRoot");
    const parent = parentCategories.find((p) => p.id.toString() === id);
    return parent?.name || "Unknown";
  };

  return (
    <Modal show={show} onClose={handleClose} size="4xl" className="z-[70]">
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          {isEditMode
            ? t("admin.categories.form.titleEdit")
            : t("admin.categories.form.titleCreate")}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="p-6 space-y-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Cột trái */}
            <div className="space-y-6">
              {/* Tên */}
              <div>
                <Label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.categories.form.nameLabel")}
                </Label>
                <TextInput
                  id="name"
                  name="name"
                  placeholder={t("admin.categories.form.namePlaceholder")}
                  value={formData.name}
                  onChange={handleInputChange}
                  color={errors.name ? "failure" : "gray"}
                  disabled={isSubmitting}
                  required
                  aria-describedby={errors.name ? "name-error" : undefined}
                  theme={{
                    field: {
                      input: {
                        base: "!bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-gray-500",
                      },
                    },
                  }}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Danh mục cha */}
              <div>
                <Label
                  htmlFor="parentId"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.categories.form.parentLabel")}
                </Label>
                <Select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  theme={{
                    field: {
                      select: {
                        base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}>
                  <option value="">
                    {t("admin.categories.form.parentPlaceholder")}
                  </option>
                  {parentCategories.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {t("admin.categories.form.parentHint")}
                </p>
              </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-6">
              {/* Mô tả */}
              <div>
                <Label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.categories.form.descriptionLabel")}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t(
                    "admin.categories.form.descriptionPlaceholder"
                  )}
                  value={formData.description}
                  onChange={handleInputChange}
                  color={errors.description ? "failure" : "gray"}
                  disabled={isSubmitting}
                  rows={6}
                  required
                  aria-describedby={
                    errors.description ? "desc-error" : undefined
                  }
                  theme={{
                    base: "!bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-gray-500",
                  }}
                />
                {errors.description && (
                  <p id="desc-error" className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Xem trước */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <Label className="mb-3 block text-lg font-medium !text-gray-700">
                  {t("admin.categories.form.previewTitle")}
                </Label>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium text-gray-600 w-20">
                      {t("admin.categories.form.previewName")}
                    </span>
                    <span className="text-gray-800">
                      {formData.name ||
                        t("admin.categories.form.previewNotSpecified")}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-600 w-20">
                      {t("admin.categories.form.previewParent")}
                    </span>
                    <span className="text-gray-800">
                      {getParentName(formData.parentId)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-600 w-20">
                      {t("admin.categories.form.previewDescription")}
                    </span>
                    <span className="text-gray-800 flex-1">
                      {formData.description ||
                        t("admin.categories.form.previewNotSpecified")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
          <Button
            color="gray"
            onClick={handleClose}
            disabled={isSubmitting}
            type="button">
            {t("admin.categories.form.buttonCancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light />
                {isEditMode
                  ? t("admin.categories.form.buttonUpdating")
                  : t("admin.categories.form.buttonCreating")}
              </div>
            ) : (
              <>
                {isEditMode
                  ? t("admin.categories.form.buttonUpdate")
                  : t("admin.categories.form.buttonCreate")}
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
