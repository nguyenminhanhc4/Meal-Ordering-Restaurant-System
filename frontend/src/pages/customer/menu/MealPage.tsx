import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Spinner } from "flowbite-react";
import { getAllMenuItems } from "../../../services/product/fetchProduct";
import type { Product } from "../../../services/product/fetchProduct";
import { useNotification } from "../../../components/Notification/NotificationContext";
import ProductCard from "../../../components/card/ProductCard";
import SearchBar from "../../../components/search_filter/SearchBar";
import SortFilter from "../../../components/search_filter/SortFilter";

/**
 * 🍽️ MealPage
 * Trang hiển thị danh sách món ăn theo danh mục.
 * Hỗ trợ: tìm kiếm, sắp xếp, "xem thêm" (load more), và loading effect.
 */
const MealPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  /** Danh sách sản phẩm hiển thị */
  const [products, setProducts] = useState<Product[]>([]);

  /** Tổng số trang do API trả về */
  const [totalPages, setTotalPages] = useState(0);

  /** Trang hiện tại (0-based) */
  const [currentPage, setCurrentPage] = useState(0);

  /** Số sản phẩm mỗi lần tải */
  const [pageSize] = useState(6);

  /** Từ khóa tìm kiếm */
  const [search, setSearch] = useState("");

  /** Kiểu sắp xếp */
  const [sort, setSort] = useState("popular");

  /** Loading: true khi đang gọi API */
  const [loading, setLoading] = useState(true);

  /** Loading phụ khi nhấn "Xem thêm" */
  const [loadingMore, setLoadingMore] = useState(false);

  const { notify } = useNotification();

  /**
   * 🔄 fetchProducts — Gọi API lấy dữ liệu món ăn
   * Dùng useCallback để tránh re-create khi render lại
   */
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
        notify("error", "Không thể tải danh sách món ăn");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categorySlug, pageSize, search, sort, notify]
  );

  /** 🧩 Tải lại dữ liệu khi categorySlug / search / sort / currentPage thay đổi */
  useEffect(() => {
    fetchProducts(currentPage, currentPage > 0);
  }, [categorySlug, currentPage, search, sort, fetchProducts]);

  /** 🔁 Reset danh sách & quay về trang đầu khi filter thay đổi */
  useEffect(() => {
    setProducts([]);
    setCurrentPage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [search, sort, categorySlug]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
        {/* === Tiêu đề danh mục === */}
        <h2 className="text-4xl font-extrabold text-center text-amber-800 mb-4 border-b-2 border-stone-800 pb-2">
          {categorySlug
            ? categorySlug
                .replace("-", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "Danh sách món ăn"}
        </h2>

        <p className="text-amber-600 text-lg text-center mb-8">
          Khám phá các món ăn ngon nhất trong danh mục
        </p>

        {/* === Thanh tìm kiếm & bộ lọc === */}
        <Card className="mb-8 !bg-white !border-stone-400 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between gap-4 p-4 items-center">
            <div className="w-full md:w-auto flex-1">
              <SearchBar search={search} setSearch={setSearch} />
            </div>

            <div className="mt-3 md:mt-0 md:ml-4 flex-none w-full md:w-auto">
              <SortFilter
                sort={sort}
                setSort={setSort}
                resetPage={() => setCurrentPage(0)}
              />
            </div>

            <div className="mt-3 md:mt-0 md:ml-4 flex-none w-full md:w-auto">
              <Button
                color="warning"
                size="md"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg transition-colors duration-200"
                href="/menu">
                Xem tất cả
              </Button>
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
                    Không có món ăn nào trong danh mục này
                  </div>
                )}
          </div>

          {/* Skeleton chỉ hiện khi load trang đầu */}
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
                  <Spinner size="sm" /> Đang tải...
                </span>
              ) : (
                "Xem thêm"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MealPage;
