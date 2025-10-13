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
    <Modal show={show} onClose={handleClose} size="md">
      <ModalHeader>
        {isEditMode ? "Edit Category" : "Add New Category"}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {/* Category Name */}
          <div>
            <Label htmlFor="name">Category Name *</Label>
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
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter category description"
              value={formData.description}
              onChange={handleInputChange}
              color={errors.description ? "failure" : "gray"}
              disabled={isSubmitting}
              rows={3}
              required
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Parent Category */}
          <div>
            <Label htmlFor="parentId">Parent Category (Optional)</Label>
            <Select
              id="parentId"
              name="parentId"
              value={formData.parentId}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="">-- No Parent (Root Category) --</option>
              {parentCategories.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to create a root category
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-end space-x-2">
            <Button
              color="gray"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditMode ? "Update Category" : "Create Category"}</>
              )}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};