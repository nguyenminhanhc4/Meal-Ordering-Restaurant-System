import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  TextInput,
  Button,
} from "flowbite-react";
import React, { useState } from "react";
import type { Table } from "../../../services/table/tableService";

// ✅ Khai báo Giờ mở cửa/đóng cửa (Tùy chỉnh theo nhu cầu)
const MIN_HOUR = 10; // 10:00 sáng
const MAX_HOUR = 22; // 22:00 tối

interface BookingModalProps {
  table: Table | null; // Bàn được chọn
  open: boolean;
  minDateTime: string; // Thời gian tối thiểu hiện tại (từ component cha)
  onClose: () => void;
  onConfirm: (data: BookingData) => void;
}

// ✅ Định nghĩa kiểu dữ liệu form mới (giúp TypeScript an toàn hơn)
export interface BookingData {
  name: string;
  phone: string;
  reservationTime: string;
  numberOfPeople: string;
}

const initialFormData: BookingData = {
  name: "",
  phone: "",
  reservationTime: "",
  numberOfPeople: "1", // Mặc định là 1 người
};

export default function BookingModal({
  table,
  open,
  minDateTime,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [formData, setFormData] = useState<BookingData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);

  if (!table) return null; // Không hiển thị nếu không có bàn

  const handleConfirm = () => {
    if (
      formError ||
      !formData.name ||
      !formData.phone ||
      !formData.reservationTime ||
      !formData.numberOfPeople
    ) {
      return; // Chặn nếu có lỗi hoặc thiếu dữ liệu bắt buộc
    }
    onConfirm(formData);
    // ✅ Reset form sau khi xác nhận
    setFormData(initialFormData);
    setFormError(null);
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
    <Modal show={open} onClose={handleClose} popup>
      {/* ✅ ĐIỀU CHỈNH 1: Header (Màu sắc thương hiệu) */}
      <ModalHeader className="border-b-8 !border-yellow-800 !bg-stone-800 text-xl font-bol">
        <div className="text-xl font-normal text-yellow-500 mt-1">
          Đặt bàn {table.name}
        </div>
        <div className="text-base font-normal text-yellow-500 mt-1">
          Sức chứa tối đa:{" "}
          <span className="font-semibold text-yellow-300">
            {table.capacity} chỗ
          </span>
        </div>
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
              color="white"
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
              type="tel" // ✅ Cải tiến: Dùng type tel cho di động
              color="white"
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
              // ✅ Cải tiến: Thêm màu viền lỗi khi có formError
              color={formError ? "red" : "white"}
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
                *Giờ làm việc: 10:00 sáng - 10:00 tối
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
              max={table.capacity.toString()}
              placeholder="1"
              value={formData.numberOfPeople}
              onChange={(e) =>
                setFormData({ ...formData, numberOfPeople: e.target.value })
              }
              required
              sizing="lg"
              color="white"
            />
            {/* ✅ Cải tiến: Thêm chú thích sức chứa */}
            <p className="mt-2 text-xs text-gray-500">
              *Bàn này có sức chứa tối đa là {table.capacity} người.
            </p>
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
          Xác nhận đặt bàn
        </Button>
        <Button color="red" onClick={handleClose} size="lg">
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
}
