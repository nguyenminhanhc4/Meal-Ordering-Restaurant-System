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
import { useTranslation } from "react-i18next";

const MIN_HOUR = 9;
const MAX_HOUR = 22;

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
  numberOfPeople: "1",
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
  const { t } = useTranslation();

  useEffect(() => {
    if (!show) return;

    if (mode === "edit" && existingReservation) {
      setFormData({
        name: user?.name || "",
        phone: user?.phone || "",
        reservationTime:
          existingReservation.reservationTime?.slice(0, 16) || "",
        numberOfPeople: existingReservation.numberOfPeople.toString(),
        note: existingReservation.note || "",
      });
    } else if (mode === "create" && user) {
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
        error = t("bookingModal.errorTime", { min: MIN_HOUR, max: MAX_HOUR });
      }
    }

    setFormError(error);
    setFormData({ ...formData, reservationTime: selectedDateTime });
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setFormError(null);
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} popup>
      <ModalHeader className="border-b-8 !border-yellow-800 !bg-stone-800 text-xl font-bol">
        <div className="text-xl font-normal text-yellow-500 mt-1">
          {mode === "edit"
            ? `${t("bookingModal.updateBooking")} ${table?.name || ""}`
            : `${t("bookingModal.createBooking")} ${table?.name || ""}`}
        </div>
        {table && (
          <div className="text-base font-normal text-yellow-500 mt-1">
            {t("bookingModal.capacity")}:{" "}
            <span className="font-semibold text-yellow-300">
              {table.capacity} {t("bookingModal.capacityUnit")}
            </span>
          </div>
        )}
      </ModalHeader>

      <ModalBody className="space-y-5 py-4 bg-white">
        <div className="space-y-5 py-4">
          {/* Tên khách hàng */}
          <div>
            <Label
              htmlFor="name"
              className="mb-1 block text-base font-medium !text-gray-700">
              {t("bookingModal.customerName")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="name"
              placeholder={t("bookingModal.customerNamePlaceholder")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled
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

          {/* Số điện thoại */}
          <div>
            <Label
              htmlFor="phone"
              className="mb-1 block text-base font-medium !text-gray-700">
              {t("bookingModal.phone")} <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="phone"
              placeholder={t("bookingModal.phonePlaceholder")}
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              disabled
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

          {/* Thời gian đặt bàn */}
          <div>
            <Label
              htmlFor="reservationTime"
              className="mb-1 block text-base font-medium !text-gray-700">
              {t("bookingModal.reservationTime")}{" "}
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
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"></path>
                </svg>
                {formError}
              </p>
            )}
            {!formError && (
              <p className="mt-2 text-xs !text-gray-500">
                {t("bookingModal.workingHours", {
                  min: MIN_HOUR,
                  max: MAX_HOUR,
                })}
              </p>
            )}
          </div>

          {/* Số lượng khách */}
          <div>
            <Label
              htmlFor="numberOfPeople"
              className="mb-1 block text-base font-medium !text-gray-700">
              {t("bookingModal.numberOfPeople")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="numberOfPeople"
              type="number"
              min="1"
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
            <p className="mt-2 text-xs text-gray-500">
              {t("bookingModal.tableCapacity", { capacity: table?.capacity })}
            </p>
          </div>

          {/* Ghi chú */}
          <div>
            <Label
              htmlFor="note"
              className="mb-1 block text-base font-medium !text-gray-700">
              {t("bookingModal.note")}
            </Label>
            <TextInput
              id="note"
              placeholder={t("bookingModal.notePlaceholder")}
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

      <ModalFooter className="justify-end border-t-8 !border-yellow-800 !bg-stone-800">
        <Button
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
          {mode === "edit"
            ? t("bookingModal.updateButton")
            : t("bookingModal.confirmButton")}
        </Button>
        <Button color="red" onClick={handleClose} size="lg">
          {t("bookingModal.cancelButton")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
