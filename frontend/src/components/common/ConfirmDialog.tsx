import React from "react";
import { Modal, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface ConfirmDialogProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  onClose,
  onConfirm,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  return (
    <Modal show={show} size="md" onClose={onClose} popup dismissible>
      <div className="p-6 text-center">
        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-600" />
        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
          {message}
        </h3>
        <div className="flex justify-center gap-4">
          <Button color="red" onClick={onConfirm}>
            {confirmText}
          </Button>
          <Button color="gray" onClick={onClose}>
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
