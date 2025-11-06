// src/pages/client/combo/ComboPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Button, Spinner } from "flowbite-react";
import { getAllCombos } from "../../../services/product/fetchCombo";
import type { Combo } from "../../../services/product/fetchCombo";
import { useNotification } from "../../../components/Notification/NotificationContext";
import { useRealtimeDelete } from "../../../api/useRealtimeUpdate";
import { useTranslation } from "react-i18next";
import ComboCard from "../../../components/card/ComboCard";
import { useParams } from "react-router-dom";

const ComboPage: React.FC = () => {
  const { comboSlug } = useParams<{ comboSlug?: string }>();
  const { t } = useTranslation();
  const { notify } = useNotification();

  const [combos, setCombos] = useState<Combo[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /** 🔄 fetch combos */
  const fetchCombos = useCallback(
    async (page: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const pageData = await getAllCombos(page, pageSize, comboSlug); // ← truyền slug

        let fetched = pageData.content;

        // Nếu backend chưa hỗ trợ filter → filter ở frontend
        if (comboSlug) {
          fetched = fetched.filter((c: Combo) => c.category === comboSlug);
        }

        setCombos((prev) => (append ? [...prev, ...fetched] : fetched));
        setTotalPages(pageData.totalPages);
      } catch (error) {
        console.error("Error fetching combos:", error);
        notify("error", t("comboPage.notification.fetchError"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize, comboSlug, notify, t]
  );

  useEffect(() => {
    setCombos([]);
    setCurrentPage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [comboSlug]);

  useEffect(() => {
    fetchCombos(currentPage, currentPage > 0);
  }, [currentPage, fetchCombos]);

  /** 🔁 realtime update */
  //   useRealtimeUpdate(
  //     "/topic/combo/new",
  //     getComboById,
  //     (updatedCombo) => {
  //       if (!updatedCombo) return;
  //       setCombos((prev) => {
  //         const exists = prev.some((c) => c.id === updatedCombo.id);
  //         return exists
  //           ? prev.map((c) => (c.id === updatedCombo.id ? updatedCombo : c))
  //           : [updatedCombo, ...prev];
  //       });
  //     },
  //     (msg: { comboId: number }) => msg.comboId
  //   );

  useRealtimeDelete<{ comboId: number }>("/topic/combo/delete", (msg) => {
    setCombos((prev) => prev.filter((c) => c.id !== msg.comboId));
  });

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
        <h2 className="text-4xl font-extrabold text-center text-amber-800 mb-4 border-b-2 border-stone-800 pb-2">
          {t("comboPage.title")}
        </h2>

        <p className="text-amber-600 text-lg text-center mb-8">
          {t("comboPage.description")}
        </p>

        <hr className="border-t-2 border-stone-800 mb-8" />

        <div className="relative min-h-[400px]">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}>
            {combos.length > 0
              ? combos.map((combo) => (
                  <ComboCard key={combo.id} combo={combo} />
                ))
              : !loading && (
                  <div className="text-gray-500 text-center col-span-full">
                    {t("comboPage.noItems")}
                  </div>
                )}
          </div>

          {loading && combos.length === 0 && (
            <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: pageSize }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-72 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          )}
        </div>

        {!loading && currentPage + 1 < totalPages && (
          <div className="text-center mt-8">
            <Button
              color="warning"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={loadingMore}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg transition-colors duration-200 disabled:opacity-70">
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> {t("comboPage.loadingMore")}
                </span>
              ) : (
                t("comboPage.actions.loadMore")
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ComboPage;
