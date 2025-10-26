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
import type { Ingredient } from "../../services/ingredient/ingredientService";

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
    if (!form.name.trim()) return alert("Tên nguyên liệu không được để trống!");
    onSuccess(form);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-lg font-bold text-gray-800">
          {existingIngredient ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu mới"}
        </h3>
      </ModalHeader>
      <ModalBody className="space-y-6 p-6 bg-gray-50">
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="name"
              className="mb-2 block text-sm font-medium !text-gray-700">
              Tên nguyên liệu
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
              Số lượng
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
              Đơn vị
            </Label>
            <TextInput
              id="unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="VD: KG, L, G..."
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
              Tồn kho tối thiểu
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
          {existingIngredient ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
        <Button color="red" onClick={onClose}>
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
}
