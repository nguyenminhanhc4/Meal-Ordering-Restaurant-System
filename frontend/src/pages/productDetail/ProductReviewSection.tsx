import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../store/AuthContext";
import { useNotification } from "../../components/Notification/NotificationContext";
import { createReview } from "../../services/review/reviewService";
import type { Product } from "../../services/product/fetchProduct";
import ProductReviewForm from ".//ProductReviewForm";
import ReviewItem from "./ReviewItem";
import Pagination from "../../components/common/PaginationClient";
import { AxiosError } from "axios";

interface ProductReviewSectionProps {
  product: Product;
  setProduct: (product: Product | null) => void;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
  product,
  setProduct,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notify } = useNotification();
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [userReview, setUserReview] = useState<Product["reviews"][0] | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState("all");
  const reviewsPerPage = 5;

  const paginatedReviews = useMemo(() => {
    if (!product?.reviews) return [];
    const start = currentPage * reviewsPerPage;
    return product.reviews.slice(start, start + reviewsPerPage);
  }, [product?.reviews, currentPage]);

  useEffect(() => {
    const userHasReviewed = product.reviews.some(
      (r) => r.userId === user?.publicId
    );
    setHasReviewed(userHasReviewed);
    if (userHasReviewed) {
      const foundReview = product.reviews.find(
        (r) => r.userId === user?.publicId
      );
      setUserReview(foundReview || null);
    }
  }, [product.reviews, user?.publicId]);

  useEffect(() => {
    setCurrentPage(0);
  }, [product?.reviews]);

  const averageRating = useMemo(() => {
    if (product.reviews && product.reviews.length > 0) {
      return (
        product.reviews.reduce((s, r) => s + r.rating, 0) /
        product.reviews.length
      );
    }
    return product.rating ?? 0;
  }, [product]);

  return (
    <>
      {user ? (
        hasReviewed ? (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium shadow-sm">
            <p>
              ✅{" "}
              {t("review.alreadyReviewed", {
                date: userReview?.createdAt
                  ? new Date(userReview.createdAt).toLocaleDateString("vi-VN")
                  : "N/A",
              })}
            </p>
            {userReview && (
              <>
                <p className="mt-2 italic text-gray-700">
                  “{userReview.comment}”
                </p>
                <p className="mt-1 text-yellow-500">
                  {Array.from({ length: userReview.rating }).map((_, i) => (
                    <span key={i} className="inline h-4 w-4">
                      ★
                    </span>
                  ))}
                </p>
              </>
            )}
          </div>
        ) : (
          <ProductReviewForm
            productId={product.id}
            onSubmit={async ({ rating, comment }) => {
              try {
                const newReview = await createReview(product.id, {
                  rating,
                  comment,
                });
                if (newReview) {
                  setProduct({
                    ...product,
                    reviews: [
                      {
                        ...newReview,
                        userAvatar: newReview.userAvatar ?? null,
                        id: newReview.id ?? 0,
                      },
                      ...product.reviews,
                    ],
                  });
                  setHasReviewed(true);
                  setUserReview({
                    ...newReview,
                    userAvatar: newReview.userAvatar ?? null,
                    id: newReview.id ?? 0,
                  });
                }
                notify("success", t("review.submitted"));
              } catch (err: unknown) {
                if (err instanceof AxiosError) {
                  if (
                    err.response?.status === 400 &&
                    err.response?.data?.message
                  ) {
                    notify("error", err.response.data.message);
                  } else {
                    notify("error", t("review.submitFailed"));
                  }
                } else {
                  notify("error", t("review.submitFailed"));
                }
              }
            }}
          />
        )
      ) : (
        <p className="text-gray-500 mt-6 italic">{t("review.loginToReview")}</p>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-stone-300">
          <h2 className="text-3xl font-bold text-gray-800">
            {t("review.customerReviews")}
          </h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="all">{t("review.filter.all")}</option>
            <option value="positive">{t("review.filter.positive")}</option>
            <option value="neutral">{t("review.filter.neutral")}</option>
            <option value="negative">{t("review.filter.negative")}</option>
          </select>
          <span className="text-gray-600 font-semibold">
            {t("review.summary")}:{" "}
            <span className="text-yellow-500 text-xl font-extrabold ml-1">
              {averageRating.toFixed(1)}/5
            </span>
            <span className="text-sm ml-1">
              {t("product.reviewsCount", { count: product.reviews.length })}
            </span>
          </span>
        </div>

        {!product.reviews || product.reviews.length === 0 ? (
          <div className="text-center text-gray-500 italic py-6">
            {t("review.noReviews")}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  product={product}
                  setProduct={setProduct}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(
                (product.reviews?.length ?? 0) / reviewsPerPage
              )}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ProductReviewSection;
