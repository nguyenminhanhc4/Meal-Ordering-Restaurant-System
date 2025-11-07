import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Spinner } from "flowbite-react";
import { getAllCombos } from "../../../services/product/fetchCombo";
import type { Combo } from "../../../services/product/fetchCombo";
import { useNotification } from "../../../components/Notification/NotificationContext";
import SearchBar from "../../../components/search_filter/SearchBar";
import SortFilter from "../../../components/search_filter/SortFilter";
import ComboCard from "../../../components/card/ComboCard";
import { useRealtimeDelete } from "../../../api/useRealtimeUpdate";
import { useTranslation } from "react-i18next";

/**
 * 🧩 ComboPage — Trang hiển thị danh sách Combo theo danh mục (slug)
 */
const ComboPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { t } = useTranslation();
  const { notify } = useNotification();

  const [combos, setCombos] = useState<Combo[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /** 🔄 Fetch combos từ API */
  const fetchCombos = useCallback(
    async (page: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        // Backend API: getAllCombos(page, size, search, categoryId, statusId, sort)
        const pageData = await getAllCombos(
          page,
          pageSize,
          search,
          undefined,
          undefined,
          sort
        );
        let fetched = pageData.content;

        if (categorySlug) {
          const normalizedSlug = categorySlug
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-");

          fetched = fetched.filter(
            (p: Combo) =>
              p.category &&
              p.category
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "-") === normalizedSlug
          );
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
    [pageSize, search, sort, categorySlug, notify, t]
  );

  /** Gọi API khi đổi trang hoặc thay đổi filter */
  useEffect(() => {
    fetchCombos(currentPage, currentPage > 0);
  }, [categorySlug, currentPage, search, sort, fetchCombos]);

  /** Reset trang khi thay đổi filter/search/danh mục */
  useEffect(() => {
    setCombos([]);
    setCurrentPage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [search, sort, categorySlug]);

  /** 🔁 Realtime delete */
  useRealtimeDelete<{ comboId: number }>("/topic/combo/delete", (msg) => {
    setCombos((prev) => prev.filter((c) => c.id !== msg.comboId));
    notify("warning", t("comboPage.notification.itemDeleted"));
  });

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
        {/* === Tiêu đề === */}
        <h2 className="text-4xl font-extrabold text-center text-amber-800 mb-4 border-b-2 border-stone-800 pb-2">
          {categorySlug
            ? categorySlug
                .replace(/-/g, " ") // thay tất cả dấu '-'
                .replace(
                  /\p{L}+/gu,
                  (word) => word.charAt(0).toUpperCase() + word.slice(1)
                )
            : t("comboPage.title")}
        </h2>

        <p className="text-amber-600 text-lg text-center mb-8">
          {t("comboPage.description")}
        </p>

        {/* === Search & Sort === */}
        <Card className="mb-8 !bg-white !border-stone-400 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
            <div className="flex-1 w-full md:w-auto">
              <SearchBar search={search} setSearch={setSearch} />
            </div>

            <div className="w-full md:w-auto flex-none">
              <SortFilter
                sort={sort}
                setSort={setSort}
                resetPage={() => setCurrentPage(0)}
              />
            </div>

            <div className="w-full md:w-auto flex-none">
              <Link
                to="/menu"
                className="block w-full md:w-auto text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition-colors duration-200">
                {t("mealPage.actions.viewAll")}
              </Link>
            </div>
          </div>
        </Card>

        <hr className="border-t-2 border-stone-800 mb-8" />

        {/* === Danh sách Combo === */}
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

          {/* Skeleton khi đang load */}
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

        {/* === Nút "Xem thêm" === */}
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
