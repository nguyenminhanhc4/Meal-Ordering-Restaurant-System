import React, { useMemo } from "react";
import { Badge } from "flowbite-react";
import { FaStarHalf, FaStar, FaRegStar } from "react-icons/fa";
import type { Product } from "../../services/product/fetchProduct";
import type { Combo } from "../../services/product/fetchCombo";
import { useTranslation } from "react-i18next";

interface ProductInfoProps {
  product: Product | Combo;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const { t } = useTranslation();
  const averageRating = useMemo(() => {
    if ("reviews" in product && product.reviews && product.reviews.length > 0) {
      return (
        product.reviews.reduce((s, r) => s + r.rating, 0) /
        product.reviews.length
      );
    }
    return "rating" in product && product.rating ? product.rating : 0;
  }, [product]);

  return (
    <>
      <div className="flex items-center gap-4 mb-3">
        <h1 className="text-4xl font-extrabold text-stone-900 leading-tight">
          {product.name}
        </h1>
      </div>

      {"reviews" in product && product.reviews ? (
        <div className="flex items-center mb-4 pb-2 border-b border-stone-200">
          {[...Array(5)].map((_, i) => {
            const starNumber = i + 1;
            return (
              <span key={i}>
                {averageRating >= starNumber ? (
                  <FaStar className="h-5 w-5 text-yellow-500" />
                ) : averageRating >= starNumber - 0.5 ? (
                  <FaStarHalf className="h-5 w-5 text-yellow-500" />
                ) : (
                  <FaRegStar className="h-5 w-5 text-gray-300" />
                )}
              </span>
            );
          })}
          <span className="ml-3 text-gray-700 font-semibold">
            {averageRating.toFixed(1)}/5
          </span>
          <span className="ml-2 text-gray-500 text-sm">
            {t("product.reviewsCount", {
              count: product.reviews?.length ?? 0,
            })}
          </span>
        </div>
      ) : null}

      <p className="text-4xl text-green-600 font-extrabold mb-4 mt-2">
        {product?.price?.toLocaleString("vi-VN") ?? "0"} {t("common.currency")}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          color={product.status === "AVAILABLE" ? "success" : "failure"}
          size="sm"
          className="font-semibold">
          {t("product.status")}:{" "}
          <span
            className={
              product.status === "AVAILABLE" ? "text-green-800" : "text-red-800"
            }>
            {product.status === "AVAILABLE"
              ? t("product.inStock")
              : t("product.outOfStock")}
          </span>
        </Badge>

        {"categoryName" in product && product.categoryName && (
          <Badge color="warning" size="sm" className="font-semibold">
            {t("product.category")}: {product.categoryName}
          </Badge>
        )}

        {"tags" in product &&
          product.tags?.map((tag) => (
            <Badge
              key={tag}
              color="indigo"
              size="sm"
              className="!bg-indigo-100 !text-indigo-800 font-medium">
              {tag}
            </Badge>
          ))}
      </div>

      <p className="text-base text-gray-600 mb-6 border-l-4 border-yellow-400 pl-3 py-1 bg-stone-50 rounded">
        {product.description || t("product.defaultDescription")}
      </p>

      <p className="text-sm text-gray-500 mb-4">
        {t("product.availableQuantity")}:{" "}
        <span className="font-bold text-gray-700">
          {"availableQuantity" in product ? product.availableQuantity ?? 0 : 0}
        </span>{" "}
        {t("product.unit")}
        {"sold" in product && product.sold && (
          <span className="ml-4">
            {t("product.sold")}:{" "}
            <span className="font-bold text-gray-700">{product.sold}</span>
          </span>
        )}
      </p>
    </>
  );
};

export default ProductInfo;
