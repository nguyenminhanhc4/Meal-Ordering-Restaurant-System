import {
  Modal,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import type { FC } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      show={open}
      onClose={onCancel}
      size="md"
      className="backdrop-blur-sm">
      {/* Header cảnh báo */}
      <ModalHeader className="!bg-red-50 rounded-t-lg border-b border-red-200">
        <h3 className="text-red-700 font-semibold">{title}</h3>
      </ModalHeader>

      {/* Nội dung */}
      <ModalBody className="bg-white">
        <p className="text-base leading-relaxed text-gray-600">{message}</p>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="bg-gray-50 rounded-b-lg flex justify-end gap-2">
        <Button
          onClick={onConfirm}
          className="!bg-red-600 hover:!bg-red-700 text-white shadow-md px-5">
          {confirmText}
        </Button>
        <Button
          onClick={onCancel}
          className="!bg-white border border-gray-300 hover:!bg-gray-100 text-gray-700 px-5">
          {cancelText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDialog;
