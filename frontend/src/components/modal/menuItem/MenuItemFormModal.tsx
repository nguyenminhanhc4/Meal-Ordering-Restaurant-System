import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Textarea,
  Select,
  Card,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "flowbite-react";
import { HiPlus, HiTrash } from "react-icons/hi";
import api from "../../../api/axios";
import { useNotification } from "../../Notification";
import type {
  MenuItem,
  Category,
  StatusParam,
  Ingredient,
  MenuItemIngredientCreateDTO,
  MenuItemIngredientUpdateDTO,
} from "../../../services/types/menuItem";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";

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
  const { t } = useTranslation();
  const { notify } = useNotification();

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
  const [selectedIngredients, setSelectedIngredients] = useState<
    IngredientSelection[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [, setSelectedFile] = useState<File | null>(null);

  const isEditMode = !!menuItemData;

  // Load ingredients
  useEffect(() => {
    if (show) {
      const loadIngredients = async () => {
        try {
          const response = await api.get<{ data: Ingredient[] }>(
            "/ingredients"
          );
          setIngredients(response.data?.data || response.data || []);
        } catch (error) {
          console.error("Error loading ingredients:", error);
          notify(
            "error",
            t("admin.menuItems.form.notifications.loadIngredientsError")
          );
        }
      };
      void loadIngredients();
    }
  }, [show, notify, t]);

  // Reset form
  useEffect(() => {
    if (show) {
      if (menuItemData) {
        setFormData({
          name: menuItemData.name,
          description: menuItemData.description,
          price: menuItemData.price,
          categoryId: menuItemData.categoryId,
          statusId: menuItemData.statusId || 0,
          avatarUrl: menuItemData.avatarUrl || "",
          availableQuantity: menuItemData.availableQuantity || 0,
        });

        setSelectedIngredients(
          menuItemData.ingredients?.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantityNeeded: ing.quantityNeeded,
            ingredientName: ing.ingredientName,
          })) || []
        );
      } else {
        const defaultCategoryId = categories.length > 0 ? categories[0].id : 0;
        const defaultStatusId = statuses.length > 0 ? statuses[0].id : 0;

        setFormData({
          name: "",
          description: "",
          price: 0,
          categoryId: defaultCategoryId,
          statusId: defaultStatusId,
          avatarUrl: "",
          availableQuantity: 0,
        });
        setSelectedIngredients([]);
      }
    }
  }, [show, menuItemData, categories, statuses]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const numValue = [
      "price",
      "categoryId",
      "statusId",
      "availableQuantity",
    ].includes(name)
      ? Number(value)
      : value;

    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const addIngredient = useCallback(() => {
    const available = ingredients.find(
      (ing) => !selectedIngredients.some((sel) => sel.ingredientId === ing.id)
    );
    if (available) {
      setSelectedIngredients((prev) => [
        ...prev,
        {
          ingredientId: available.id,
          quantityNeeded: 1,
          ingredientName: available.name,
        },
      ]);
    }
  }, [ingredients, selectedIngredients]);

  const removeIngredient = useCallback((index: number) => {
    setSelectedIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateIngredient = useCallback(
    (
      index: number,
      field: keyof IngredientSelection,
      value: string | number
    ) => {
      setSelectedIngredients((prev) =>
        prev.map((ing, i) => {
          if (i !== index) return ing;
          const updated = { ...ing, [field]: value };
          if (field === "ingredientId") {
            const ingredient = ingredients.find((ingr) => ingr.id === value);
            updated.ingredientName = ingredient?.name;
          }
          return updated;
        })
      );
    },
    [ingredients]
  );

  const getAvailableIngredients = useCallback(
    (currentId?: number) => {
      return ingredients.filter(
        (ing) =>
          ing.id === currentId ||
          !selectedIngredients.some((sel) => sel.ingredientId === ing.id)
      );
    },
    [ingredients, selectedIngredients]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("error", t("admin.menuItems.form.validation.imageInvalid"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify("error", t("admin.menuItems.form.validation.imageSize"));
      return;
    }

    setSelectedFile(file);
    uploadImageToCloudinary(file);
  };

  const uploadImageToCloudinary = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post<{ data: string }>(
        "/menu-items/upload-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.data) {
        setFormData((prev) => ({ ...prev, avatarUrl: response.data.data }));
        notify(
          "success",
          t("admin.menuItems.form.notifications.uploadSuccess")
        );
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const msg = error.response?.data?.message ?? error.message;

        if (status === 500) {
          notify(
            "warning",
            t("admin.menuItems.form.notifications.uploadWarning")
          );
        } else {
          notify(
            "error",
            t("admin.menuItems.form.notifications.uploadError", { error: msg })
          );
        }
      } else {
        notify(
          "error",
          t("admin.menuItems.form.notifications.uploadError", {
            error: "Lỗi không xác định",
          })
        );
      }
    } finally {
      setUploadingImage(false);
      setSelectedFile(null);
      const input = document.getElementById("avatarFile") as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim())
      return notify("error", t("admin.menuItems.form.validation.nameRequired"));
    if (formData.price <= 0)
      return notify(
        "error",
        t("admin.menuItems.form.validation.priceRequired")
      );
    if (!formData.categoryId)
      return notify(
        "error",
        t("admin.menuItems.form.validation.categoryRequired")
      );
    if (!formData.statusId)
      return notify(
        "error",
        t("admin.menuItems.form.validation.statusRequired")
      );

    const validStatus = statuses.find((s) => s.id === formData.statusId);
    if (!validStatus)
      return notify(
        "error",
        t("admin.menuItems.form.validation.statusInvalid")
      );

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ingredients: selectedIngredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantityNeeded: ing.quantityNeeded,
        })) as MenuItemIngredientCreateDTO[] | MenuItemIngredientUpdateDTO[],
      };

      if (isEditMode && menuItemData) {
        await api.put(`/menu-items/admin/${menuItemData.id}`, payload);
        notify(
          "success",
          t("admin.menuItems.form.notifications.updateSuccess")
        );
      } else {
        await api.post("/menu-items/admin", payload);
        notify(
          "success",
          t("admin.menuItems.form.notifications.createSuccess")
        );
      }

      onSuccess();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const msg = error.response?.data?.message ?? error.message;

        if (msg?.includes("getInventory")) {
          notify(
            "error",
            t("admin.menuItems.form.notifications.inventoryError")
          );
        } else {
          notify(
            "error",
            t("admin.menuItems.form.notifications.saveError", { error: msg })
          );
        }
      } else {
        notify(
          "error",
          t("admin.menuItems.form.notifications.saveError", {
            error: "Lỗi không xác định",
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="5xl"
      className="shadow-lg z-[70]">
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          {isEditMode
            ? t("admin.menuItems.form.titleEdit")
            : t("admin.menuItems.form.titleCreate")}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <ModalBody className="p-6 space-y-6 bg-gray-50">
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.menuItems.form.nameLabel")}
              </Label>
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("admin.menuItems.form.namePlaceholder")}
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
            </div>

            <div>
              <Label
                htmlFor="price"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.menuItems.form.priceLabel")}
              </Label>
              <TextInput
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={handleInputChange}
                placeholder={t("admin.menuItems.form.pricePlaceholder")}
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
            </div>

            <div>
              <Label
                htmlFor="availableQuantity"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.menuItems.form.quantityLabel")}
              </Label>
              <TextInput
                id="availableQuantity"
                name="availableQuantity"
                type="number"
                min="0"
                value={formData.availableQuantity}
                onChange={handleInputChange}
                placeholder={t("admin.menuItems.form.quantityPlaceholder")}
                className="w-full"
                theme={{
                  field: {
                    input: {
                      base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <Label
                htmlFor="categoryId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.menuItems.form.categoryLabel")}
              </Label>
              <Select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full"
                theme={{
                  field: {
                    select: {
                      base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value={0}>
                  {t("common.select")} {t("admin.menuItems.form.categoryLabel")}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label
                htmlFor="statusId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.menuItems.form.statusLabel")}
              </Label>
              <Select
                id="statusId"
                name="statusId"
                value={formData.statusId}
                onChange={handleInputChange}
                required
                className="w-full"
                theme={{
                  field: {
                    select: {
                      base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value={0}>
                  {t("common.select")} {t("admin.menuItems.form.statusLabel")}
                </option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.code}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="description"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.menuItems.form.descriptionLabel")}
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t("admin.menuItems.form.descriptionPlaceholder")}
              rows={3}
              className="w-full resize-none"
              theme={{
                base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
              }}
            />
          </div>

          {/* Image Upload */}
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <Label className="mb-3 block text-lg font-medium !text-gray-700">
              {t("admin.menuItems.form.imageSection")}
            </Label>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="avatarFile"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.menuItems.form.uploadLabel")}
                </Label>
                <input
                  id="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 !bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("admin.menuItems.form.uploadHint")}
                </p>
              </div>

              <div>
                <Label
                  htmlFor="avatarUrl"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.menuItems.form.urlLabel")}
                </Label>
                <TextInput
                  id="avatarUrl"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  placeholder={t("admin.menuItems.form.urlPlaceholder")}
                  className="w-full text-sm"
                  theme={{
                    field: {
                      input: {
                        base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                      },
                    },
                  }}
                />
              </div>

              {uploadingImage && (
                <div className="flex items-center text-sm text-cyan-600">
                  <Spinner size="sm" className="mr-2" />
                  {t("admin.menuItems.form.uploading")}
                </div>
              )}

              {formData.avatarUrl && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    {t("admin.menuItems.form.previewTitle")}
                  </div>
                  <div className="flex items-start space-x-3">
                    <img
                      src={formData.avatarUrl}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-cyan-400"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 break-all bg-gray-100 p-2 rounded">
                        {formData.avatarUrl}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <Card className="!bg-white border !border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold !text-gray-700">
                {t("admin.menuItems.form.ingredientsSection")}
              </h3>
              <Button
                type="button"
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 text-white"
                onClick={addIngredient}
                disabled={selectedIngredients.length >= ingredients.length}>
                <HiPlus className="mr-2 h-4 w-4" />
                {t("admin.menuItems.form.addButton")}
              </Button>
            </div>

            {selectedIngredients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {t("admin.menuItems.form.noIngredients")}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedIngredients.map((ing, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <Select
                        value={ing.ingredientId}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            "ingredientId",
                            Number(e.target.value)
                          )
                        }
                        theme={{
                          field: {
                            select: {
                              base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                            },
                          },
                        }}>
                        <option value={0}>
                          {t("admin.menuItems.form.ingredientSelect")}
                        </option>
                        {getAvailableIngredients(ing.ingredientId).map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.unit})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-32">
                      <TextInput
                        type="number"
                        min="0"
                        step="0.1"
                        value={ing.quantityNeeded}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            "quantityNeeded",
                            Number(e.target.value)
                          )
                        }
                        placeholder={t("admin.menuItems.form.quantityInput")}
                        theme={{
                          field: {
                            input: {
                              base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                            },
                          },
                        }}
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
        </ModalBody>

        <ModalFooter className="p-4 border-t bg-gray-50 border-gray-200 flex justify-end space-x-2">
          <Button
            color="red"
            onClick={onClose}
            disabled={loading}
            className="text-gray-50">
            {t("admin.menuItems.form.buttonCancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 text-white disabled:bg-cyan-400">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light={true} />
                {t("admin.menuItems.form.buttonSaving")}
              </div>
            ) : isEditMode ? (
              t("admin.menuItems.form.buttonUpdate")
            ) : (
              t("admin.menuItems.form.buttonCreate")
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
