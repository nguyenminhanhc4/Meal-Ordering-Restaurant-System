import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Textarea,
  Select,
  Card,
} from "flowbite-react";
import { HiPlus, HiTrash } from "react-icons/hi";
import api from "../../api/axios";
import { useNotification } from "../Notification";
import type {
  MenuItem,
  MenuItemCreateDTO,
  MenuItemUpdateDTO,
  Category,
  StatusParam,
  Ingredient,
  MenuItemIngredientCreateDTO,
  MenuItemIngredientUpdateDTO,
} from "../../services/types/menuItem";

interface MenuItemFormModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  menuItemData?: MenuItem;
  categories: Category[];
  statuses: StatusParam[];
}

interface IngredientSelection {
  ingredientId: number;
  quantityNeeded: number;
  ingredientName?: string;
}

export function MenuItemFormModal({
  show,
  onClose,
  onSuccess,
  menuItemData,
  categories,
  statuses,
}: MenuItemFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: 0,
    statusId: 0,
    avatarUrl: "",
    availableQuantity: 0,
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { notify } = useNotification();

  // Load ingredients when modal opens
  useEffect(() => {
    if (show) {
      const loadIngredients = async () => {
        try {
          const response = await api.get('/ingredients');
          if (response.data?.data) {
            setIngredients(response.data.data);
          } else if (response.data) {
            setIngredients(response.data);
          }
        } catch (error) {
          console.error("Error loading ingredients:", error);
          notify("error", "Could not load ingredients");
        }
      };

      void loadIngredients();
    }
  }, [show, notify]);

  // Reset form when modal opens/closes or menuItemData changes
  useEffect(() => {
    if (show) {
      console.log("� STATUS DEBUG - Modal opened with statuses:", statuses.length, "items");
      statuses.forEach(status => {
        console.log(`📊 STATUS DEBUG - Form Status: ID=${status.id}, Code=${status.code}, Name=${status.name}`);
      });
      
      if (menuItemData) {
        // Edit mode
        setFormData({
          name: menuItemData.name,
          description: menuItemData.description,
          price: menuItemData.price,
          categoryId: menuItemData.categoryId,
          statusId: menuItemData.statusId || 0,
          avatarUrl: menuItemData.avatarUrl || "",
          availableQuantity: menuItemData.availableQuantity || 0,
        });

        // Load existing ingredients
        if (menuItemData.ingredients && menuItemData.ingredients.length > 0) {
          console.log("🥬 Loading existing ingredients:", menuItemData.ingredients);
          setSelectedIngredients(
            menuItemData.ingredients.map((ing) => ({
              ingredientId: ing.ingredientId,
              quantityNeeded: ing.quantityNeeded,
              ingredientName: ing.ingredientName,
            }))
          );
        } else {
          console.log("🥬 No existing ingredients found");
          setSelectedIngredients([]);
        }
      } else {
        // Create mode
        console.log("➕ Setting form to create mode");
        console.log("📊 STATUS DEBUG - Available statuses for create mode:", statuses);
        
        const defaultData = {
          name: "",
          description: "",
          price: 0,
          categoryId: categories.length > 0 ? categories[0].id : 0,
          statusId: statuses.length > 0 ? statuses[0].id : 0,
          avatarUrl: "",
          availableQuantity: 0,
        };
        console.log("📝 Default form data:", defaultData);
        console.log("📊 STATUS DEBUG - Default statusId set to:", defaultData.statusId);
        setFormData(defaultData);
        setSelectedIngredients([]);
      }
    }
  }, [show, menuItemData, categories, statuses]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === "price" || name === "categoryId" || name === "statusId" || name === "availableQuantity" 
      ? Number(value) 
      : value;
    
    console.log(`📝 Form field changed: ${name} = ${newValue}`);
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const addIngredient = () => {
    if (ingredients.length > 0) {
      const firstAvailableIngredient = ingredients.find(
        (ing) => !selectedIngredients.some((sel) => sel.ingredientId === ing.id)
      );

      if (firstAvailableIngredient) {
        setSelectedIngredients((prev) => [
          ...prev,
          {
            ingredientId: firstAvailableIngredient.id,
            quantityNeeded: 1,
            ingredientName: firstAvailableIngredient.name,
          },
        ]);
      }
    }
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientSelection, value: string | number) => {
    setSelectedIngredients((prev) =>
      prev.map((ing, i) => {
        if (i === index) {
          const updated = { ...ing, [field]: value };
          if (field === "ingredientId") {
            const ingredient = ingredients.find((ingr) => ingr.id === value);
            updated.ingredientName = ingredient?.name;
          }
          return updated;
        }
        return ing;
      })
    );
  };

  const getAvailableIngredients = (currentIngredientId?: number) => {
    return ingredients.filter(
      (ing) =>
        ing.id === currentIngredientId ||
        !selectedIngredients.some((sel) => sel.ingredientId === ing.id)
    );
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        notify("error", "Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notify("error", "Image size must be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      uploadImageToCloudinary(file);
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file: File) => {
    setUploadingImage(true);
    
    try {
      console.log("📤 Uploading file:", file.name, file.size, file.type);
      
      const formData = new FormData();
      formData.append('image', file);

      console.log("🌐 Calling API: POST /menu-items/upload-image");
      
      // Try new endpoint first
      let response;
      try {
        response = await api.post('/menu-items/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (uploadError) {
        console.warn("❌ New upload endpoint failed, trying fallback...");
        // Fallback: For now, just show a placeholder URL and let user input manually
        notify("warning", "Upload feature requires backend restart. Please enter image URL manually for now.");
        return;
      }

      console.log("✅ Upload response:", response.data);

      if (response.data?.data) {
        setFormData(prev => ({
          ...prev,
          avatarUrl: response.data.data
        }));
        notify("success", "Image uploaded successfully");
        console.log("🖼️ Image URL set:", response.data.data);
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      
      // Log detailed error information
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          status?: number; 
          message?: string; 
          response?: { data?: { message?: string; error?: string } }; 
          config?: { url?: string } 
        };
        console.error("📊 UPLOAD DEBUG - Error details:");
        console.error("  - Status:", axiosError.status);
        console.error("  - URL:", axiosError.config?.url);
        console.error("  - Response data:", axiosError.response?.data);
        
        if (axiosError.status === 500) {
          notify("error", "Server error during upload. Please restart backend and try again.");
        } else if (axiosError.response?.data?.message) {
          notify("error", `Upload failed: ${axiosError.response.data.message}`);
        } else {
          notify("error", `Upload failed: ${axiosError.message}`);
        }
      } else {
        notify("error", "Failed to upload image. Please check if backend is running.");
      }
    } finally {
      setUploadingImage(false);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('avatarFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Submitting form with data:", formData);
    console.log("🥬 Selected ingredients:", selectedIngredients);
    
    if (!formData.name.trim()) {
      notify("error", "Menu item name is required");
      return;
    }
    
    if (formData.price <= 0) {
      notify("error", "Price must be greater than 0");
      return;
    }
    
    if (!formData.categoryId) {
      notify("error", "Category is required");
      return;
    }
    
    if (!formData.statusId) {
      notify("error", "Status is required");
      return;
    }

    // Validate statusId exists in available statuses
    const validStatus = statuses.find(s => s.id === formData.statusId);
    if (!validStatus) {
      console.error("📊 STATUS DEBUG - Invalid statusId:", formData.statusId);
      console.error("📊 STATUS DEBUG - Available status IDs:", statuses.map(s => s.id));
      notify("error", "Selected status is invalid");
      return;
    }
    console.log("📊 STATUS DEBUG - Valid status selected:", validStatus);

    setLoading(true);
    
    try {
      if (menuItemData) {
        // Update existing menu item
        const updateData: MenuItemUpdateDTO = {
          ...formData,
          ingredients: selectedIngredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantityNeeded: ing.quantityNeeded,
          } as MenuItemIngredientUpdateDTO)),
        };

        console.log("✏️ Updating menu item with data:", updateData);
        const response = await api.put(`/menu-items/admin/${menuItemData.id}`, updateData);
        console.log("✅ Update response:", response.data);
        notify("success", "Menu item updated successfully");
      } else {
        // Create new menu item
        const createData: MenuItemCreateDTO = {
          ...formData,
          ingredients: selectedIngredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantityNeeded: ing.quantityNeeded,
          } as MenuItemIngredientCreateDTO)),
        };

        console.log("➕ Creating menu item with data:", createData);
        console.log("📊 STATUS DEBUG - Available statuses for validation:");
        statuses.forEach(s => console.log(`  - Status ID=${s.id}, Code=${s.code}`));
        console.log("📊 STATUS DEBUG - Selected statusId in form:", createData.statusId);
        
        const response = await api.post("/menu-items/admin", createData);
        console.log("✅ Create response:", response.data);
        notify("success", "Menu item created successfully");
      }
      
      onSuccess();
    } catch (error: unknown) {
      console.error("❌ Error saving menu item:", error);
      
      // Log detailed error information for debugging
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          status?: number; 
          message?: string; 
          response?: { data?: { message?: string } }; 
          config?: { data?: string } 
        };
        console.error("📊 STATUS DEBUG - Error details:");
        console.error("  - Status:", axiosError.status);
        console.error("  - Response data:", axiosError.response?.data);
        console.error("  - Request data:", axiosError.config?.data);
        
        if (axiosError.response?.data?.message) {
          console.error("📊 STATUS DEBUG - Backend error message:", axiosError.response.data.message);
          if (axiosError.response.data.message.includes("getInventory")) {
            notify("error", "Backend inventory error. Please check if inventory table exists and has proper setup.");
          } else {
            notify("error", `Failed to save menu item: ${axiosError.response.data.message}`);
          }
        } else {
          notify("error", `Failed to save menu item: ${axiosError.message}`);
        }
      } else {
        notify("error", `Failed to save menu item: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {menuItemData ? "Edit Menu Item" : "Add New Menu Item"}
        </h3>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Name *
              </Label>
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter menu item name"
                required
              />
            </div>

            <div>
              <Label htmlFor="price" className="mb-2 block">
                Price (VND) *
              </Label>
              <TextInput
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                required
              />
            </div>

            <div>
              <Label htmlFor="categoryId" className="mb-2 block">
                Category *
              </Label>
              <Select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required>
                <option value={0}>Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="statusId" className="mb-2 block">
                Status *
              </Label>
              <Select
                id="statusId"
                name="statusId"
                value={formData.statusId}
                onChange={handleInputChange}
                required>
                <option value={0}>Select Status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.code}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="availableQuantity" className="mb-2 block">
                Available Quantity
              </Label>
              <TextInput
                id="availableQuantity"
                name="availableQuantity"
                type="number"
                min="0"
                value={formData.availableQuantity}
                onChange={handleInputChange}
                placeholder="Enter available quantity"
              />
            </div>

            <div>
              <Label htmlFor="avatarFile" className="mb-2 block">
                Image Upload
              </Label>
              <div className="space-y-3">
                {/* File Upload */}
                <div>
                  <input
                    id="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-cyan-50 file:text-cyan-700
                      hover:file:bg-cyan-100"
                    disabled={uploadingImage}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                  </div>
                </div>
                
                {/* Manual URL Input */}
                <div>
                  <Label htmlFor="avatarUrl" className="mb-1 block text-sm">
                    Or enter image URL manually:
                  </Label>
                  <TextInput
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="text-sm"
                  />
                </div>
                
                {/* Show current image if exists */}
                {formData.avatarUrl && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Current image:</div>
                    <img 
                      src={formData.avatarUrl} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="text-xs text-gray-500 break-all">
                      {formData.avatarUrl}
                    </div>
                  </div>
                )}
                
                {/* Upload progress indicator */}
                {uploadingImage && (
                  <div className="text-sm text-cyan-600">
                    Uploading image...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter menu item description"
              rows={3}
            />
          </div>

          {/* Ingredients Section */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
              <Button
                type="button"
                size="sm"
                color="cyan"
                onClick={addIngredient}
                disabled={selectedIngredients.length >= ingredients.length}>
                <HiPlus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>

            {selectedIngredients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No ingredients added yet</p>
            ) : (
              <div className="space-y-3">
                {selectedIngredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <Select
                        value={ingredient.ingredientId}
                        onChange={(e) =>
                          updateIngredient(index, "ingredientId", Number(e.target.value))
                        }>
                        <option value={0}>Select Ingredient</option>
                        {getAvailableIngredients(ingredient.ingredientId).map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-32">
                      <TextInput
                        type="number"
                        min="0"
                        step="0.1"
                        value={ingredient.quantityNeeded}
                        onChange={(e) =>
                          updateIngredient(index, "quantityNeeded", Number(e.target.value))
                        }
                        placeholder="Quantity"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      color="failure"
                      onClick={() => removeIngredient(index)}>
                      <HiTrash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </form>
      </div>

      <div className="border-t border-gray-200 p-6">
        <div className="flex justify-end gap-4">
          <Button color="gray" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="cyan"
            onClick={handleSubmit}
            disabled={loading}>
            {loading ? "Saving..." : menuItemData ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}