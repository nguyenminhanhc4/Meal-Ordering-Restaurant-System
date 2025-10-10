import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  TextInput,
  Button,
} from "flowbite-react";
import React, { useState, useEffect } from "react";
import type { TableEntity } from "../../../services/table/tableService";
import type { Reservation } from "../../../services/reservation/reservationService";
import { useAuth } from "../../../store/AuthContext";

// ✅ Khai báo Giờ mở cửa/đóng cửa (Tùy chỉnh theo nhu cầu)
const MIN_HOUR = 9; // 9:00 sáng
const MAX_HOUR = 22; // 22:00 tối

interface BookingModalProps {
  table?: TableEntity | null;
  show: boolean;
  minDateTime: string;
  onClose: () => void;
  onConfirm: (data: BookingData) => Promise<void>;
  onConfirmEdit?: (data: BookingData) => Promise<void>;
  existingReservation?: Reservation | null;
  mode?: "create" | "edit";
}

// ✅ Định nghĩa kiểu dữ liệu form mới (giúp TypeScript an toàn hơn)
export interface BookingData {
  name: string;
  phone: string;
  reservationTime: string;
  numberOfPeople: string;
  note?: string;
}

const initialFormData: BookingData = {
  name: "",
  phone: "",
  reservationTime: "",
  numberOfPeople: "1", // Mặc định là 1 người
};

export default function BookingModal({
  table,
  show,
  minDateTime,
  onClose,
  onConfirm,
  onConfirmEdit,
  existingReservation,
  mode,
}: BookingModalProps) {
  const [formData, setFormData] = useState<BookingData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!show) return;

    if (mode === "edit" && existingReservation) {
      // Đổ dữ liệu từ reservation API vào form
      setFormData({
        name: user?.name || "",
        phone: user?.phone || "",
        reservationTime:
          existingReservation.reservationTime?.slice(0, 16) || "",
        numberOfPeople: existingReservation.numberOfPeople.toString(),
        note: existingReservation.note || "",
      });
    } else if (mode === "create" && user) {
      // Reset form khi tạo mới
      setFormData({
        ...initialFormData,
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [show, mode, existingReservation, user]);

  const handleConfirm = async () => {
    if (mode === "edit" && onConfirmEdit) {
      await onConfirmEdit(formData);
    } else {
      await onConfirm(formData);
    }
  };

  const handleReservationTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedDateTime = e.target.value;
    let error: string | null = null;

    if (selectedDateTime) {
      const selectedHour = parseInt(selectedDateTime.substring(11, 13));

      if (selectedHour < MIN_HOUR || selectedHour > MAX_HOUR) {
        error = `⚠️ Giờ đặt bàn phải trong khoảng từ ${MIN_HOUR}:00 đến ${MAX_HOUR}:00.`;
      }
    }

    setFormError(error);
    setFormData({ ...formData, reservationTime: selectedDateTime });
  };

  const handleClose = () => {
    setFormData(initialFormData); // Reset form khi đóng
    setFormError(null);
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} popup>
      {/* ✅ ĐIỀU CHỈNH 1: Header (Màu sắc thương hiệu) */}
      <ModalHeader className="border-b-8 !border-yellow-800 !bg-stone-800 text-xl font-bol">
        <div className="text-xl font-normal text-yellow-500 mt-1">
          {mode === "edit"
            ? `Cập nhật đặt bàn   ${table?.name || ""}`
            : `Đặt bàn ${table?.name || ""}`}
        </div>
        {table && (
          <div className="text-base font-normal text-yellow-500 mt-1">
            Sức chứa tối đa:{" "}
            <span className="font-semibold text-yellow-300">
              {table.capacity} chỗ
            </span>
          </div>
        )}
      </ModalHeader>

      <ModalBody className="space-y-5 py-4 bg-white">
        <div className="space-y-5 py-4">
          {/* 1. Tên khách hàng */}
          <div>
            <Label
              htmlFor="name"
              className="mb-1 block text-base font-medium !text-gray-700">
              Tên khách hàng <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="name"
              placeholder="Nhập tên khách"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              sizing="lg"
              theme={{
                field: {
                  input: {
                    base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                  },
                },
              }}
            />
          </div>
          {/* 2. Số điện thoại */}
          <div>
            <Label
              htmlFor="phone"
              className="mb-1 block text-base font-medium !text-gray-700">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="phone"
              placeholder="0123456789"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              sizing="lg"
              type="tel"
              theme={{
                field: {
                  input: {
                    base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                  },
                },
              }}
            />
          </div>

          {/* 3. THỜI GIAN ĐẶT BÀN */}
          <div>
            <Label
              htmlFor="reservationTime"
              className="mb-1 block text-base font-medium !text-gray-700">
              Thời gian đặt bàn (Ngày & Giờ){" "}
              <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="reservationTime"
              type="datetime-local"
              value={formData.reservationTime}
              onChange={handleReservationTimeChange}
              required
              sizing="lg"
              min={minDateTime}
              theme={{
                field: {
                  input: {
                    base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                  },
                },
              }}
            />
            {formError && (
              <p className="mt-2 text-sm font-medium text-red-600 flex items-center">
                {/* ✅ Thêm icon (giả định có thể dùng icon nếu setup) */}
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"></path>
                </svg>
                {formError}
              </p>
            )}
            {/* ✅ Chú thích giờ làm việc */}
            {!formError && (
              <p className="mt-2 text-xs !text-gray-500">
                *Giờ làm việc: 9:00 sáng - 22:00 tối
              </p>
            )}
          </div>

          {/* 4. SỐ LƯỢNG NGƯỜI */}
          <div>
            <Label
              htmlFor="numberOfPeople"
              className="mb-1 block text-base font-medium !text-gray-700">
              Số lượng khách <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="numberOfPeople"
              type="number"
              min="1"
              // ✅ Cải tiến: Thêm thuộc tính max dựa trên sức chứa bàn
              max={table?.capacity.toString()}
              placeholder="1"
              value={formData.numberOfPeople}
              onChange={(e) =>
                setFormData({ ...formData, numberOfPeople: e.target.value })
              }
              required
              sizing="lg"
              theme={{
                field: {
                  input: {
                    base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                  },
                },
              }}
            />
            {/* ✅ Cải tiến: Thêm chú thích sức chứa */}
            <p className="mt-2 text-xs text-gray-500">
              *Bàn này có sức chứa tối đa là {table?.capacity} người.
            </p>
          </div>

          <div>
            <Label
              htmlFor="note"
              className="mb-1 block text-base font-medium !text-gray-700">
              Ghi chú thêm (nếu có)
            </Label>
            <TextInput
              id="note"
              placeholder="Sinh nhật, họp mặt, ..."
              value={formData.note || ""}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              sizing="lg"
              theme={{
                field: {
                  input: {
                    base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                  },
                },
              }}
            />
          </div>
        </div>
      </ModalBody>
      {/* ✅ ĐIỀU CHỈNH 2: Footer (Viền phân cách rõ ràng hơn) */}
      <ModalFooter className="justify-end border-t-8 !border-yellow-800 !bg-stone-800">
        <Button
          // ✅ Đổi màu success sang màu vàng (brand color)
          color="yellow"
          onClick={handleConfirm}
          disabled={
            !formData.name ||
            !formData.phone ||
            !formData.reservationTime ||
            !formData.numberOfPeople ||
            !!formError
          }
          size="lg">
          {mode === "edit" ? "Cập nhật thông tin" : "Xác nhận đặt bàn"}
        </Button>
        <Button color="red" onClick={handleClose} size="lg">
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
}
