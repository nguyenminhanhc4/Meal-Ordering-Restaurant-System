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
import { useTranslation } from "react-i18next"; // Add useTranslation
import { useNotification } from "../../../components/Notification"; // Add useNotification
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
  const { t } = useTranslation(); // Add hook useTranslation
  const { notify } = useNotification(); // Add hook useNotification
  const [form, setForm] = useState<Ingredient>({
    name: "",
    quantity: 0,
    unit: "",
    minimumStock: 0,
  });

  useEffect(() => {
    if (!show) {
      setForm({ name: "", quantity: 0, unit: "", minimumStock: 0 });
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
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      notify("error", t("admin.ingredients.notifications.nameRequiredError")); // Use i18n and notify
      return;
    }
    onSuccess(form);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-lg font-bold text-gray-800">
          {existingIngredient
            ? t("admin.ingredients.form.editTitle") // Use i18n
            : t("admin.ingredients.form.createTitle")}{" "}
        </h3>
      </ModalHeader>
      <ModalBody className="space-y-6 p-6 bg-gray-50">
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="name"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.ingredients.form.labels.name")} {/* Use i18n */}
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
          </div>
          <div>
            <Label
              htmlFor="quantity"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.ingredients.form.labels.quantity")} {/* Use i18n */}
            </Label>
            <TextInput
              id="quantity"
              name="quantity"
              type="number"
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
          </div>
          <div>
            <Label
              htmlFor="unit"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.ingredients.form.labels.unit")} {/* Use i18n */}
            </Label>
            <TextInput
              id="unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder={t("admin.ingredients.form.placeholders.unit")} // Use i18n
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
              htmlFor="minimumStock"
              className="mb-2 block text-sm font-medium !text-gray-700">
              {t("admin.ingredients.form.labels.minimumStock")} {/* Use i18n */}
            </Label>
            <TextInput
              id="minimumStock"
              name="minimumStock"
              type="number"
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
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
        <Button color="blue" onClick={handleSubmit}>
          {existingIngredient
            ? t("admin.ingredients.form.buttons.save") // Use i18n
            : t("admin.ingredients.form.buttons.create")}{" "}
        </Button>
        <Button color="red" onClick={onClose}>
          {t("admin.ingredients.form.buttons.cancel")} {/* Use i18n */}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
