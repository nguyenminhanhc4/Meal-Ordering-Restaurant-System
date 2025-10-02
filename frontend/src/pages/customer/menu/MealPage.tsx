import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAllMenuItems } from "../../../services/product/fetchProduct";
import type { Product } from "../../../services/product/fetchProduct";
import { useNotification } from "../../../components/Notification/NotificationContext";
import ProductCard from "../../../components/card/ProductCard";
import SearchBar from "../../../components/search_filter/SearchBar";
import SortFilter from "../../../components/search_filter/SortFilter";
import { Card, Button } from "flowbite-react";

const MealPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const { notify } = useNotification();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllMenuItems();
        const filteredProducts = categorySlug
          ? allProducts.filter((p: Product) => p.categorySlug === categorySlug)
          : allProducts;
        setProducts(filteredProducts);
        console.log("Fetched products:", filteredProducts);
      } catch {
        notify("error", "Không thể tải danh sách món ăn");
      }
    };

    fetchProducts();
  }, [categorySlug, notify]);

  const displayedProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <section className="min-h-screen bg-gradient-to-b bg-amber-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
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
        <Card className="mb-8 !bg-white !border-stone-400 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between gap-4 p-4 items-center">
            {/* Search bar giữ nguyên chiều dài */}
            <div className="w-full md:w-auto flex-1">
              <SearchBar search={search} setSearch={setSearch} />
            </div>

            {/* Sort filter */}
            <div className="mt-3 md:mt-0 md:ml-4 flex-none w-full md:w-auto">
              <SortFilter sort={sort} setSort={setSort} />
            </div>

            {/* Nút Xem tất cả */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="text-gray-500 text-center col-span-full">
              Không có món ăn nào trong danh mục này
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MealPage;
