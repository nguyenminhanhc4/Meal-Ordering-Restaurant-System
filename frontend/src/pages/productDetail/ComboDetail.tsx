import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, HRTrimmed } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import { useNotification } from "../../components/Notification/NotificationContext";
import { getComboById } from "../../services/product/fetchCombo";
import type { Combo } from "../../services/product/fetchCombo";
import { useRealtimeUpdate } from "../../api/useRealtimeUpdate";
import { useTranslation } from "react-i18next";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import ProductAddToCart from "./ProductAddToCart";
// import ProductReviewSection from "./ProductReviewSection";

const ComboDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [combo, setCombo] = useState<Combo | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imgError, setImgError] = useState<boolean>(false);
  const navigate = useNavigate();
  const { notify } = useNotification();

  /** 🧠 Fetch combo detail */
  const fetchCombo = useCallback(async () => {
    const scrollY = window.scrollY;
    setIsLoading(true);
    try {
      const res = await getComboById(id!);
      if (!res) {
        notify("error", t("comboDetail.notFound"));
        setCombo(null);
      } else {
        setCombo(res);
      }
    } catch {
      notify("error", t("comboDetail.loadError"));
    } finally {
      setIsLoading(false);
      window.scrollTo(0, scrollY);
    }
  }, [id, notify, t]);

  useEffect(() => {
    fetchCombo();
  }, [fetchCombo]);

  /** 🔁 Realtime update combo info */
  useRealtimeUpdate(
    `/topic/combo/${id}`,
    getComboById,
    (updated) => {
      if (!updated || updated.id !== combo?.id) return;
      setCombo(updated);
      notify("info", t("comboDetail.updated", { name: updated.name }));
    },
    (msg: { comboId: number }) => msg.comboId
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

  if (!combo) {
    return (
      <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto text-center text-gray-500 py-12 px-4 md:px-6">
          {t("comboDetail.notFound")}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto animate-fadeIn py-12 px-4 md:px-6">
        <Button
          onClick={() => navigate(-1)}
          size="sm"
          className="!bg-white !text-stone-700 border !border-stone-300 hover:!bg-stone-100 shadow-sm transition-all mb-8 w-fit"
          aria-label={t("comboDetail.backToList")}>
          <HiArrowLeft className="h-4 w-4 mr-2" />
          {t("comboDetail.backToList")}
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductImage
            product={combo}
            imgError={imgError}
            setImgError={setImgError}
          />

          <div>
            <ProductInfo product={combo} />

            {/* 🔸 Hiển thị danh sách món trong combo */}
            <div className="mt-4 text-gray-600 text-sm border-t border-stone-200 pt-3">
              <h4 className="font-semibold mb-2">
                {t("comboDetail.itemsTitle")}
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {combo.items.map((item) => (
                  <li key={item.id}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <ProductAddToCart
              product={combo}
              quantity={quantity}
              setQuantity={setQuantity}
            />
          </div>
        </div>

        <HRTrimmed className="!bg-stone-300 w-full mt-16" />
        {/* {combo && (
          <ProductReviewSection product={combo} setProduct={setCombo} />
        )} */}
      </div>
    </section>
  );
};

export default ComboDetail;
