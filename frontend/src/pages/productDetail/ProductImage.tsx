import React from "react";
import type { Product } from "../../services/product/fetchProduct";
import type { Combo } from "../../services/product/fetchCombo";
import { useTranslation } from "react-i18next";

interface ProductImageProps {
  product: Product | Combo;
  imgError: boolean;
  setImgError: (error: boolean) => void;
}

const ProductImage: React.FC<ProductImageProps> = ({
  product,
  imgError,
  setImgError,
}) => {
  const { t } = useTranslation();
  const isNew =
    "createdAt" in product &&
    new Date(product.createdAt) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="group relative">
      {product.avatarUrl && !imgError ? (
        <img
          src={product.avatarUrl}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-80 md:h-[450px] object-cover rounded-2xl shadow-xl border border-stone-200 group-hover:scale-[1.03] transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-80 md:h-[450px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 shadow-lg">
          {t("product.noImage")}
        </div>
      )}

      {isNew && (
        <span className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 font-semibold rounded-full shadow-lg animate-pulse">
          {t("product.new")}
        </span>
      )}
    </div>
  );
};

export default ProductImage;
