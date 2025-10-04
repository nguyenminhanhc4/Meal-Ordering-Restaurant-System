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

const MealPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(3);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const pageData = await getAllMenuItems(
          currentPage,
          pageSize,
          search,
          sort,
          categorySlug
        );
        let allProducts = pageData.content;

        if (categorySlug) {
          allProducts = allProducts.filter(
            (p: Product) => p.categorySlug === categorySlug
          );
        }

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

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
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

        {/* Thanh tìm kiếm và sắp xếp */}
        <Card className="mb-8 !bg-white !border-stone-400 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between gap-4 p-4 items-center">
            <div className="w-full md:w-auto flex-1">
              <SearchBar search={search} setSearch={setSearch} />
            </div>

            <div className="mt-3 md:mt-0 md:ml-4 flex-none w-full md:w-auto">
              <SortFilter sort={sort} setSort={setSort} />
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

        {/* Danh sách món ăn (với Skeleton overlay) */}
        <div className="relative min-h-[400px]">
          {/* Grid hiển thị sản phẩm */}
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

          {/* Skeleton overlay khi loading */}
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

        {/* Phân trang */}
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
