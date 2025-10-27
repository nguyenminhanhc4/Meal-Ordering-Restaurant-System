import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button, HRTrimmed } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import { useNotification } from "../../components/Notification/NotificationContext";
import { getMenuItemById } from "../../services/product/fetchProduct";
import type { Product } from "../../services/product/fetchProduct";
import { useRealtimeUpdate } from "../../api/useRealtimeUpdate";
import { useTranslation } from "react-i18next";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import ProductAddToCart from "./ProductAddToCart";
import ProductReviewSection from "./ProductReviewSection";

const ProductDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imgError, setImgError] = useState<boolean>(false);
  const { notify } = useNotification();

  const fetchProduct = useCallback(async () => {
    const scrollY = window.scrollY;
    setIsLoading(true);
    try {
      const res = await getMenuItemById(id!, "all");
      if (!res) {
        notify("error", t("product.notFound"));
        setProduct(null);
      } else {
        setProduct(res);
      }
    } catch {
      notify("error", t("product.loadError"));
    } finally {
      setIsLoading(false);
    }
    window.scrollTo(0, scrollY);
  }, [id, notify, t]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useRealtimeUpdate(
    `/topic/menu/${id}`,
    () => fetchProduct(),
    () => {
      notify("info", t("product.updated"));
    },
    (msg: { menuItemId: number }) => msg.menuItemId
  );

  if (isLoading) {
    return (
      <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto text-center text-gray-500 py-12 px-4 md:px-6">
          {t("common.loading")}
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto text-center text-gray-500 py-12 px-4 md:px-6">
          {t("product.notFound")}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto animate-fadeIn py-12 px-4 md:px-6">
        <Button
          href="/menu"
          size="sm"
          className="!bg-white !text-stone-700 border !border-stone-300 hover:!bg-stone-100 shadow-sm transition-all mb-8 w-fit"
          aria-label={t("product.backToMenu")}>
          <HiArrowLeft className="h-4 w-4 mr-2" />
          {t("product.backToMenu")}
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductImage
            product={product}
            imgError={imgError}
            setImgError={setImgError}
          />
          <div>
            <ProductInfo product={product} />
            <ProductAddToCart
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
            />
          </div>
        </div>

        <HRTrimmed className="!bg-stone-300 w-full mt-16" />
        <ProductReviewSection product={product} setProduct={setProduct} />
      </div>
    </section>
  );
};

export default ProductDetail;
