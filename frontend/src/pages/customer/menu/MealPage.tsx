import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Spinner } from "flowbite-react";
import {
  getAllMenuItems,
  getMenuItemById,
} from "../../../services/product/fetchProduct";
import type { Product } from "../../../services/product/fetchProduct";
import { useNotification } from "../../../components/Notification/NotificationContext";
import ProductCard from "../../../components/card/ProductCard";
import SearchBar from "../../../components/search_filter/SearchBar";
import SortFilter from "../../../components/search_filter/SortFilter";
import {
  useRealtimeUpdate,
  useRealtimeDelete,
} from "../../../api/useRealtimeUpdate.ts";
import { useTranslation } from "react-i18next";

/**
 * 🍽️ MealPage
 * Trang hiển thị danh sách món ăn theo danh mục.
 */
const MealPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { t } = useTranslation();
  const { notify } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /** 🔄 fetchProducts — Gọi API lấy dữ liệu món ăn */
  const fetchProducts = useCallback(
    async (page: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const pageData = await getAllMenuItems(
          page,
          pageSize,
          search,
          sort,
          categorySlug
        );

        let fetched = pageData.content;
        if (categorySlug) {
          fetched = fetched.filter(
            (p: Product) => p.categorySlug === categorySlug
          );
        }

        setProducts((prev) => (append ? [...prev, ...fetched] : fetched));
        setTotalPages(pageData.totalPages);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        notify("error", t("mealPage.notification.fetchError"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categorySlug, pageSize, search, sort, notify, t]
  );

  useEffect(() => {
    fetchProducts(currentPage, currentPage > 0);
  }, [categorySlug, currentPage, search, sort, fetchProducts]);

  useEffect(() => {
    setProducts([]);
    setCurrentPage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [search, sort, categorySlug]);

  /** 🔁 Realtime updates */
  useRealtimeUpdate(
    `/topic/menu/new`,
    getMenuItemById,
    (updatedOrNewProduct) => {
      if (!updatedOrNewProduct) return;
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === updatedOrNewProduct.id);
        if (exists) {
          return prev.map((p) =>
            p.id === updatedOrNewProduct.id ? updatedOrNewProduct : p
          );
        }
        return [updatedOrNewProduct, ...prev];
      });

      notify(
        "info",
        t("mealPage.notification.itemUpdatedOrAdded", {
          name: updatedOrNewProduct.name,
        })
      );
    },
    (msg: { menuItemId: number }) => msg.menuItemId
  );

  useRealtimeDelete<{ menuItemId: number }>("/topic/menu/delete", (msg) => {
    setProducts((prev) => prev.filter((p) => p.id !== msg.menuItemId));
    notify("warning", t("mealPage.notification.itemDeleted"));
  });

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
        {/* === Tiêu đề danh mục === */}
        <h2 className="text-4xl font-extrabold text-center text-amber-800 mb-4 border-b-2 border-stone-800 pb-2">
          {categorySlug
            ? categorySlug
                .replace("-", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : t("mealPage.title.default")}
        </h2>

        <p className="text-amber-600 text-lg text-center mb-8">
          {t("mealPage.description")}
        </p>

        {/* === Thanh tìm kiếm & bộ lọc === */}
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
              <a
                href="/menu"
                className="block w-full md:w-auto text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition-colors duration-200">
                {t("mealPage.actions.viewAll")}
              </a>
            </div>
          </div>
        </Card>

        <hr className="border-t-2 border-stone-800 mb-8" />

        {/* === Danh sách món ăn === */}
        <div className="relative min-h-[400px]">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}>
            {products.length > 0
              ? products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              : !loading && (
                  <div className="text-gray-500 text-center col-span-full">
                    {t("mealPage.noItems")}
                  </div>
                )}
          </div>

          {/* Skeleton khi đang load trang đầu */}
          {loading && products.length === 0 && (
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
                  <Spinner size="sm" /> {t("mealPage.loadingMore")}
                </span>
              ) : (
                t("mealPage.actions.loadMore")
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MealPage;
