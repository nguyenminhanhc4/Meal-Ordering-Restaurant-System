import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { useAuth } from "../../store/AuthContext";
import type { Product } from "../../services/product/fetchProduct";
import { updateReview } from "../../services/review/reviewService";
import ReviewDropdown from "./ReviewDropdown";
import EditReviewForm from "./EditReviewForm";
import { useNotification } from "../../components/Notification/NotificationContext";
import { useTranslation } from "react-i18next";

interface ReviewItemProps {
  review: Product["reviews"][0];
  product: Product;
  setProduct: (product: Product | null) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  product,
  setProduct,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const { notify } = useNotification();
  const getRandomGradient = (str: string) => {
    const colors = [
      "from-green-400 to-teal-500",
      "from-purple-400 to-pink-500",
      "from-blue-400 to-indigo-500",
      "from-yellow-400 to-orange-500",
      "from-red-400 to-pink-500",
      "from-cyan-400 to-blue-500",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white p-4 border border-stone-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start gap-3">
        {review.userAvatar ? (
          <img
            src={review.userAvatar}
            alt={review.userName}
            className="w-10 h-10 rounded-full object-cover border border-green-500/50"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm bg-gradient-to-r ${getRandomGradient(
              review.userName ?? "U"
            )}`}>
            {review.userName?.charAt(0) ?? "U"}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 text-base">
                {review.userName}
              </span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <p className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </p>

              {user?.publicId === review.userId && (
                <ReviewDropdown
                  review={review}
                  product={product}
                  setProduct={setProduct}
                  editingReviewId={editingReviewId}
                  setEditingReviewId={setEditingReviewId}
                />
              )}
            </div>
          </div>

          {editingReviewId === review.id ? (
            <EditReviewForm
              review={review}
              onSave={async (updatedData: {
                rating: number;
                comment: string;
              }) => {
                try {
                  const updated = await updateReview(review.id, updatedData);
                  setProduct({
                    ...product,
                    reviews: product.reviews.map((r) =>
                      r.id === review.id ? { ...r, ...updated } : r
                    ),
                  });
                  notify("success", t("review.updated"));
                  setEditingReviewId(null);
                } catch (err) {
                  notify("error", t("review.updateFailed"));
                  console.error(err);
                }
              }}
              onCancel={() => setEditingReviewId(null)}
            />
          ) : (
            <p className="mt-2 text-gray-700 text-sm bg-stone-100 p-3 rounded-md italic border border-stone-200">
              "{review.comment}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
