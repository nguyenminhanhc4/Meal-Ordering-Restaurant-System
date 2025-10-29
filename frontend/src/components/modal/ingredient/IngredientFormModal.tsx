import {
  Modal,
  Button,
  Label,
  TextInput,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../components/Notification";
import type { Ingredient } from "../../../services/ingredient/ingredientService";

interface Props {
  show: boolean;
  onClose: () => void;
  onSuccess: (data: Ingredient) => void;
  existingIngredient?: Ingredient | null;
}

export default function IngredientFormModal({
  show,
  onClose,
  onSuccess,
  existingIngredient,
}: Props) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [form, setForm] = useState<Ingredient>({
    name: "",
    quantity: 0,
    unit: "",
    minimumStock: 0,
  });

  // Lưu trữ lỗi validate
  const [errors, setErrors] = useState({
    name: "",
    quantity: "",
    unit: "",
    minimumStock: "",
  });

  useEffect(() => {
    if (!show) {
      setForm({ name: "", quantity: 0, unit: "", minimumStock: 0 });
      setErrors({ name: "", quantity: "", unit: "", minimumStock: "" });
    }
  }, [show]);

  useEffect(() => {
    if (existingIngredient) setForm(existingIngredient);
    else
      setForm({
        name: "",
        quantity: 0,
        unit: "",
        minimumStock: 0,
      });
  }, [existingIngredient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? Number(value) : value;
    setForm({ ...form, [name]: newValue });

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = () => {
    const newErrors = { name: "", quantity: "", unit: "", minimumStock: "" };
    let hasError = false;

    if (!form.name.trim()) {
      newErrors.name = t("admin.ingredients.notifications.nameRequiredError");
      hasError = true;
    }

    if (form.quantity <= 0) {
      newErrors.quantity = t(
        "admin.ingredients.notifications.quantityPositiveError"
      );
      hasError = true;
    }

    if (!form.unit.trim()) {
      newErrors.unit = t("admin.ingredients.notifications.unitRequiredError");
      hasError = true;
    }

    if (form.minimumStock < 0) {
      newErrors.minimumStock = t(
        "admin.ingredients.notifications.minimumStockNonNegativeError"
      );
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      notify("error", t("admin.ingredients.notifications.saveError"));
      return;
    }

    onSuccess(form);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-lg font-bold text-gray-800">
          {existingIngredient
            ? t("admin.ingredients.form.editTitle")
            : t("admin.ingredients.form.createTitle")}
        </h3>
      </ModalHeader>

      <ModalBody className="space-y-6 p-6 bg-gray-50">
        <div className="space-y-4">
          {/* Tên nguyên liệu */}
          <div>
            <Label
              htmlFor="name"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.ingredients.form.labels.name")}
            </Label>
            <TextInput
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              theme={{
                field: {
                  input: {
                    base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                  },
                },
              }}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Số lượng */}
          <div>
            <Label
              htmlFor="quantity"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.ingredients.form.labels.quantity")}
            </Label>
            <TextInput
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              value={form.quantity}
              onChange={handleChange}
              theme={{
                field: {
                  input: {
                    base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                  },
                },
              }}
            />
            {errors.quantity && (
              <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Đơn vị */}
          <div>
            <Label
              htmlFor="unit"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.ingredients.form.labels.unit")}
            </Label>
            <TextInput
              id="unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder={t("admin.ingredients.form.placeholders.unit")}
              theme={{
                field: {
                  input: {
                    base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                  },
                },
              }}
            />
            {errors.unit && (
              <p className="text-red-600 text-sm mt-1">{errors.unit}</p>
            )}
          </div>

          {/* Tồn kho tối thiểu */}
          <div>
            <Label
              htmlFor="minimumStock"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.ingredients.form.labels.minimumStock")}
            </Label>
            <TextInput
              id="minimumStock"
              name="minimumStock"
              type="number"
              min={1}
              value={form.minimumStock}
              onChange={handleChange}
              theme={{
                field: {
                  input: {
                    base: "!text-gray-700 !bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                  },
                },
              }}
            />
            {errors.minimumStock && (
              <p className="text-red-600 text-sm mt-1">{errors.minimumStock}</p>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
        <Button color="blue" onClick={handleSubmit}>
          {existingIngredient
            ? t("admin.ingredients.form.buttons.save")
            : t("admin.ingredients.form.buttons.create")}
        </Button>
        <Button color="red" onClick={onClose}>
          {t("admin.ingredients.form.buttons.cancel")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
