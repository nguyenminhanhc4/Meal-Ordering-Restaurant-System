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
import React, { useState, useEffect } from "react";
import { useNotification } from "../Notification";
import api from "../../api/axios";

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
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    parentId: "",
  });

  const [parentCategories, setParentCategories] = useState<ParentCategoryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const { notify } = useNotification();

  const isEditMode = !!categoryData;

  // Load form data when editing
  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || "",
        description: categoryData.description || "",
        parentId: categoryData.parentId?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        parentId: "",
      });
    }
    setErrors({});
  }, [categoryData, show]);

  // Load parent categories for dropdown
  const loadParentCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response.data) {
        // Filter out current category if editing to prevent self-reference
        let categories = response.data;
        if (categoryData) {
          categories = categories.filter((cat: ParentCategoryOption) => cat.id !== categoryData.id);
        }
        setParentCategories(categories);
      }
    } catch (error) {
      console.error("Error loading parent categories:", error);
      notify("error", "Failed to load parent categories");
    }
  };

  useEffect(() => {
    if (show) {
      void loadParentCategories();
    }
  }, [show, categoryData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof CategoryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
      };

      if (isEditMode && categoryData) {
        // Update existing category
        await api.put(`/categories/${categoryData.id}`, payload);
        notify("success", "Category updated successfully!");
      } else {
        // Create new category
        await api.post("/categories", payload);
        notify("success", "Category created successfully!");
      }

      onSuccess();
    } catch (error: unknown) {
      console.error("Error saving category:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save category";
      notify("error", errorMessage);
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

  return (
    <Modal show={show} onClose={handleClose} size="4xl" className="shadow-lg">
      {/* Modal Header */}
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          {isEditMode ? "Edit Category" : "Create New Category"}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Modal Body */}
        <ModalBody className="p-6 space-y-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <Label htmlFor="name" className="mb-2 block text-sm font-medium !text-gray-700">
                  Category Name *
                </Label>
                <TextInput
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleInputChange}
                  color={errors.name ? "failure" : "gray"}
                  disabled={isSubmitting}
                  required
                  className="w-full"
                  theme={{
                    field: {
                      input: {
                        base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Parent Category */}
              <div>
                <Label htmlFor="parentId" className="mb-2 block text-sm font-medium !text-gray-700">
                  Parent Category (Optional)
                </Label>
                <Select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full"
                  theme={{
                    field: {
                      select: {
                        base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}
                >
                  <option value="">-- No Parent (Root Category) --</option>
                  {parentCategories.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to create a root category
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <Label htmlFor="description" className="mb-2 block text-sm font-medium !text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={handleInputChange}
                  color={errors.description ? "failure" : "gray"}
                  disabled={isSubmitting}
                  rows={6}
                  required
                  className="w-full resize-none"
                  theme={{
                    base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                  }}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Preview/Info Section */}
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <Label className="mb-3 block text-lg font-medium !text-gray-700">
                  Category Preview
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <span className="text-sm text-gray-800">{formData.name || "Not specified"}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-gray-600">Parent:</span>
                    <span className="text-sm text-gray-800">
                      {formData.parentId 
                        ? parentCategories.find(p => p.id.toString() === formData.parentId)?.name || "Unknown"
                        : "Root Category"
                      }
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <span className="text-sm text-gray-800 flex-1">
                      {formData.description || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        {/* Modal Footer */}
        <ModalFooter className="p-4 border-t bg-gray-50 border-gray-200 flex justify-end space-x-2">
          <Button
            color="red"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 text-white disabled:bg-cyan-400"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light={true} />
                {isEditMode ? "Updating..." : "Creating..."}
              </div>
            ) : (
              <>{isEditMode ? "Update Category" : "Create Category"}</>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};