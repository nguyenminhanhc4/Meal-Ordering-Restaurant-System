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
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import type {
  Combo,
  ComboRequest,
  Category,
  StatusParam,
  MenuItem,
} from "../../../services/product/fetchCombo";
import type { Page } from "../../../services/types/PageType";
import { updateCombo, createCombo } from "../../../services/product/fetchCombo";

interface ComboFormModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  comboData?: Combo;
  categories: Category[];
  statuses: StatusParam[];
}

interface ComboItemSelection {
  menuItemId: number;
  quantity: number;
  menuItemName?: string;
}

const inputTheme = {
  field: {
    input: {
      base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
    },
    select: {
      base: "!text-gray-700 !bg-white border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
    },
  },
};

export function ComboFormModal({
  show,
  onClose,
  onSuccess,
  comboData,
  categories,
  statuses,
}: ComboFormModalProps) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const isEditMode = !!comboData;

  const [formData, setFormData] = useState<ComboRequest>({
    name: "",
    description: "",
    avatarUrl: "",
    categoryId: 0,
    statusId: 0,
    items: [],
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ComboItemSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [, setSelectedFile] = useState<File | null>(null);

  // Load menu items
  useEffect(() => {
    if (!show) return;

    const loadMenuItems = async () => {
      setLoadingItems(true);
      try {
        const res = await api.get<{ data: Page<MenuItem> }>("/menu-items");

        const data = Array.isArray(res.data.data.content)
          ? res.data.data.content
          : Array.isArray(res.data)
          ? res.data
          : [];

        console.log(data);
        setMenuItems(data);
      } catch {
        notify("error", t("admin.combos.form.loadMenuItemsError"));
        setMenuItems([]);
      } finally {
        setLoadingItems(false);
      }
    };
    void loadMenuItems();
  }, [show, notify, t]);

  // Reset form
  useEffect(() => {
    if (!show) return;

    if (comboData) {
      setFormData({
        name: comboData.name,
        description: comboData.description || "",
        avatarUrl: comboData.avatarUrl || "",
        categoryId:
          categories.find((c) => c.name === comboData.category)?.id ||
          categories[0]?.id ||
          0,
        statusId:
          statuses.find((s) => s.code === comboData.status)?.id ||
          statuses[0]?.id ||
          0,
        items: [],
      });

      setSelectedItems(
        comboData.items?.map((ci) => ({
          menuItemId: ci.id,
          quantity: ci.quantity,
          menuItemName: ci.name,
        })) || []
      );
    } else {
      setFormData({
        name: "",
        description: "",
        avatarUrl: "",
        categoryId: categories[0]?.id || 0,
        statusId:
          statuses.find((s) => s.code === "ACTIVE")?.id || statuses[0]?.id || 0,
        items: [],
      });
      setSelectedItems([]);
    }
  }, [show, comboData, categories, statuses]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const numValue = ["categoryId", "statusId"].includes(name)
      ? Number(value)
      : value;
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const addComboItem = useCallback(() => {
    const available = menuItems.find(
      (mi) => !selectedItems.some((sel) => sel.menuItemId === mi.id)
    );
    if (available) {
      setSelectedItems((prev) => [
        ...prev,
        {
          menuItemId: available.id,
          quantity: 1,
          menuItemName: available.name,
        },
      ]);
    }
  }, [menuItems, selectedItems]);

  const removeComboItem = useCallback((index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateComboItem = useCallback(
    (index: number, field: "menuItemId" | "quantity", value: number) => {
      setSelectedItems((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;
          const updated = { ...item, [field]: value };
          if (field === "menuItemId") {
            const menuItem = menuItems.find((mi) => mi.id === value);
            updated.menuItemName = menuItem?.name;
          }
          return updated;
        })
      );
    },
    [menuItems]
  );

  const getAvailableMenuItems = useCallback(
    (currentId?: number) => {
      return menuItems.filter(
        (mi) =>
          mi.id === currentId ||
          !selectedItems.some((sel) => sel.menuItemId === mi.id)
      );
    },
    [menuItems, selectedItems]
  );

  // Upload image
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("error", t("admin.combos.form.validation.imageInvalid"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify("error", t("admin.combos.form.validation.imageSize"));
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
        notify("success", t("admin.combos.form.uploadSuccess"));
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const msg = error.response?.data?.message ?? error.message;
        notify("error", t("admin.combos.form.uploadError", { error: msg }));
      } else {
        notify(
          "error",
          t("admin.combos.form.uploadError", { error: "Lỗi không xác định" })
        );
      }
    } finally {
      setUploadingImage(false);
      setSelectedFile(null);
      const input = document.getElementById(
        "comboAvatarFile"
      ) as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim())
      return notify("error", t("admin.combos.form.validation.nameRequired"));
    if (selectedItems.length === 0)
      return notify("error", t("admin.combos.form.validation.atLeastOneItem"));
    if (selectedItems.some((i) => i.menuItemId === 0))
      return notify("error", t("admin.combos.form.validation.selectAllItems"));

    setLoading(true);
    try {
      const payload: ComboRequest = {
        ...formData,
        items: selectedItems.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
        })),
      };

      if (isEditMode && comboData) {
        await updateCombo(comboData.id, payload);

        notify("success", t("admin.combos.form.updateSuccess"));
        onSuccess();
      } else {
        await createCombo(payload);
        notify("success", t("admin.combos.form.createSuccess"));
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      notify("error", t("admin.combos.form.saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="5xl" className="z-[70]">
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          {isEditMode
            ? t("admin.combos.form.titleEdit")
            : t("admin.combos.form.titleCreate")}
        </h3>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <ModalBody className="p-6 space-y-6 bg-gray-50">
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.combos.form.nameLabel")}
              </Label>
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("admin.combos.form.namePlaceholder")}
                className="w-full"
                theme={inputTheme}
              />
            </div>

            <div>
              <Label
                htmlFor="categoryId"
                className="mb-2 block text-sm font-medium !text-gray-700">
                {t("admin.combos.form.categoryLabel")}
              </Label>
              <Select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full"
                theme={inputTheme}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentCategory
                      ? `${c.parentCategory.name} → ${c.name}`
                      : c.name}
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
              {t("admin.combos.form.descriptionLabel")}
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t("admin.combos.form.descriptionPlaceholder")}
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
              {t("admin.combos.form.imageSection")}
            </Label>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="comboAvatarFile"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.combos.form.uploadLabel")}
                </Label>
                <input
                  id="comboAvatarFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 !bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("admin.combos.form.uploadHint")}
                </p>
              </div>

              <div>
                <Label
                  htmlFor="avatarUrl"
                  className="mb-2 block text-sm font-medium !text-gray-700">
                  {t("admin.combos.form.urlLabel")}
                </Label>
                <TextInput
                  id="avatarUrl"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  placeholder={t("admin.combos.form.urlPlaceholder")}
                  className="w-full text-sm"
                  theme={inputTheme}
                />
              </div>

              {uploadingImage && (
                <div className="flex items-center text-sm text-cyan-600">
                  <Spinner size="sm" className="mr-2" />
                  {t("admin.combos.form.uploading")}
                </div>
              )}

              {formData.avatarUrl && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    {t("admin.combos.form.previewTitle")}
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

          {/* Status */}
          <div>
            <Label
              htmlFor="statusId"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.combos.form.statusLabel")}
            </Label>
            <Select
              id="statusId"
              name="statusId"
              value={formData.statusId}
              onChange={handleInputChange}
              className="w-full"
              theme={inputTheme}>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(`status.${s.code.toLowerCase()}`) || s.code}
                </option>
              ))}
            </Select>
          </div>

          {/* Combo Items */}
          <Card className="!bg-white border !border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold !text-gray-700">
                {t("admin.combos.form.itemsSection")}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({selectedItems.length} món)
                </span>
              </h3>
              <Button
                type="button"
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 text-white"
                onClick={addComboItem}
                disabled={
                  loadingItems || selectedItems.length >= menuItems.length
                }>
                {loadingItems ? (
                  <Spinner size="sm" />
                ) : (
                  <HiPlus className="mr-2 h-4 w-4" />
                )}
                {t("admin.combos.form.addButton")}
              </Button>
            </div>

            {loadingItems ? (
              <div className="text-center py-8">
                <Spinner size="lg" />
              </div>
            ) : selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {t("admin.combos.form.noItems")}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <Select
                        value={item.menuItemId}
                        onChange={(e) =>
                          updateComboItem(
                            index,
                            "menuItemId",
                            Number(e.target.value)
                          )
                        }
                        theme={inputTheme}>
                        <option value={0}>
                          {t("admin.combos.form.itemSelect")}
                        </option>
                        {getAvailableMenuItems(item.menuItemId).map((mi) => (
                          <option key={mi.id} value={mi.id}>
                            {mi.name} — {mi.categoryName}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-32">
                      <TextInput
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateComboItem(
                            index,
                            "quantity",
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        placeholder={t("admin.combos.form.quantityInput")}
                        theme={inputTheme}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      color="red"
                      onClick={() => removeComboItem(index)}>
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
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 text-white disabled:bg-cyan-400">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" light={true} />
                {t("common.saving")}
              </div>
            ) : isEditMode ? (
              t("common.update")
            ) : (
              t("common.create")
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
