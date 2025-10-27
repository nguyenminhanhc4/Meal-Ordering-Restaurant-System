import React, { useState } from "react";
import { BsThreeDotsVertical, BsPencil, BsTrash } from "react-icons/bs";
import ConfirmDialog from "../../components/common/ConfirmDialogProps";
import { useNotification } from "../../components/Notification/NotificationContext";
import { deleteReview } from "../../services/review/reviewService";
import type { Product } from "../../services/product/fetchProduct";
import { useTranslation } from "react-i18next";

interface ReviewDropdownProps {
  review: Product["reviews"][0];
  product: Product;
  setProduct: (product: Product | null) => void;
  editingReviewId: number | null;
  setEditingReviewId: (id: number | null) => void;
}

const ReviewDropdown: React.FC<ReviewDropdownProps> = ({
  review,
  product,
  setProduct,
  editingReviewId,
  setEditingReviewId,
}) => {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!selectedReviewId) return;
    try {
      await deleteReview(selectedReviewId);
      setProduct({
        ...product,
        reviews: product.reviews.filter((r) => r.id !== selectedReviewId),
      });
      notify("success", t("review.deleted"));
    } catch (err) {
      notify("error", t("review.deleteFailed"));
      console.error(err);
    } finally {
      setOpenConfirm(false);
      setIsDropdownOpen(null);
      setSelectedReviewId(null);
    }
  };

  return (
    <>
      <button
        className={`text-gray-500 hover:text-gray-900 p-1 rounded-full transition ${
          editingReviewId === review.id
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-stone-100"
        }`}
        disabled={editingReviewId === review.id}
        onClick={() =>
          setIsDropdownOpen(isDropdownOpen === review.id ? null : review.id)
        }>
        <BsThreeDotsVertical className="w-4 h-4" />
      </button>

      {isDropdownOpen === review.id && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-stone-200 rounded-lg shadow-xl z-10 overflow-hidden">
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            onClick={() => {
              setEditingReviewId(review.id);
              setIsDropdownOpen(null);
            }}>
            <BsPencil className="w-4 h-4 mr-2" />
            {t("review.edit")}
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
            onClick={() => {
              setSelectedReviewId(review.id);
              setOpenConfirm(true);
            }}>
            <BsTrash className="w-4 h-4 mr-2" />
            {t("review.delete")}
          </button>
          <ConfirmDialog
            open={openConfirm}
            title={t("review.deleteConfirmTitle")}
            message={t("review.deleteConfirmMessage")}
            confirmText={t("review.delete")}
            cancelText={t("review.cancel")}
            onConfirm={handleDelete}
            onCancel={() => {
              setOpenConfirm(false);
              setIsDropdownOpen(null);
            }}
          />
        </div>
      )}
    </>
  );
};

export default ReviewDropdown;
