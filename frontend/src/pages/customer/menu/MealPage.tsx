import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Button } from "flowbite-react";
import { getAllMenuItems } from "../../../services/product/fetchProduct";
import type { Product } from "../../../services/product/fetchProduct";
import { useNotification } from "../../../components/Notification/NotificationContext";
import ProductCard from "../../../components/card/ProductCard";
import SearchBar from "../../../components/search_filter/SearchBar";
import SortFilter from "../../../components/search_filter/SortFilter";
import Pagination from "../../../components/common/PaginationClient";

/**
 * 🥘 MealPage Component
 * Hiển thị danh sách các món ăn theo danh mục (categorySlug),
 * hỗ trợ tìm kiếm, sắp xếp, phân trang và hiệu ứng loading.
 */
const MealPage: React.FC = () => {
  /** Lấy slug danh mục từ URL (ví dụ: /menu/pizza -> categorySlug = "pizza") */
  const { categorySlug } = useParams<{ categorySlug: string }>();

  /** Danh sách sản phẩm hiện tại trên trang */
  const [products, setProducts] = useState<Product[]>([]);

  /** Tổng số trang có sẵn từ API */
  const [totalPages, setTotalPages] = useState(0);

  /** Trang hiện tại (0-based index) */
  const [currentPage, setCurrentPage] = useState(0);

  /** Số lượng sản phẩm trên mỗi trang */
  const [pageSize] = useState(6);

  /** Từ khoá tìm kiếm hiện tại */
  const [search, setSearch] = useState("");

  /** Kiểu sắp xếp hiện tại ("popular" | "price" | "newest" ...) */
  const [sort, setSort] = useState("popular");

  /** Trạng thái loading (đang tải dữ liệu) */
  const [loading, setLoading] = useState(true);

  /** Context thông báo toàn cục (hiển thị alert / toast) */
  const { notify } = useNotification();

  /**
   * useEffect #1 — Gọi API để tải danh sách món ăn
   * Chạy lại mỗi khi thay đổi categorySlug, currentPage, search hoặc sort
   */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Gọi API lấy dữ liệu trang hiện tại
        const pageData = await getAllMenuItems(
          currentPage,
          pageSize,
          search,
          sort,
          categorySlug
        );

        let allProducts = pageData.content;

        // Nếu có categorySlug, chỉ lọc sản phẩm thuộc danh mục đó
        if (categorySlug) {
          allProducts = allProducts.filter(
            (p: Product) => p.categorySlug === categorySlug
          );
        }

        // Cập nhật state hiển thị
        setProducts(allProducts);
        setTotalPages(pageData.totalPages);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        notify("error", "Không thể tải danh sách món ăn");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, currentPage, search, sort]);

  /**
   * useEffect #2 — Reset trang về 0 khi bộ lọc thay đổi
   * Tránh việc người dùng đang ở trang cao, mà kết quả filter ít hơn
   */
  useEffect(() => {
    setCurrentPage(0);
  }, [search, sort, categorySlug]);

  /**
   * UI phần thân trang
   * Gồm: tiêu đề, bộ lọc, danh sách sản phẩm, loading skeleton và pagination
   */
  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
        {/* --- Tiêu đề danh mục --- */}
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

        {/* --- Bộ lọc tìm kiếm và sắp xếp --- */}
        <Card className="mb-8 !bg-white !border-stone-400 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between gap-4 p-4 items-center">
            {/* Ô tìm kiếm */}
            <div className="w-full md:w-auto flex-1">
              <SearchBar search={search} setSearch={setSearch} />
            </div>

            {/* Bộ sắp xếp */}
            <div className="mt-3 md:mt-0 md:ml-4 flex-none w-full md:w-auto">
              <SortFilter sort={sort} setSort={setSort} />
            </div>

            {/* Nút xem tất cả món ăn */}
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

        {/* --- Danh sách món ăn (với Skeleton overlay khi loading) --- */}
        <div className="relative min-h-[400px]">
          {/* Lưới sản phẩm */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}>
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="text-gray-500 text-center col-span-full">
                Không có món ăn nào trong danh mục này
              </div>
            )}
          </div>

          {/* Hiệu ứng skeleton loading (overlay) */}
          {loading && (
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

        {/* --- Phân trang (Pagination component) --- */}
        {products.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </section>
  );
};

export default MealPage;
