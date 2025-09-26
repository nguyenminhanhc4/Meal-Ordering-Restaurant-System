import React from "react";
import { Button, Badge } from "flowbite-react";
import { HiStar, HiEye, HiShoppingCart } from "react-icons/hi";
import type { Product } from "../../services/mock/mockProducts";
import { useNotification } from "../Notification/NotificationContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { notify } = useNotification();

  const handleAddToCart = () => {
    if (product.status !== "available") {
      notify("error", `${product.name} hiện không có sẵn`);
      return;
    }
    notify("success", `Đã thêm ${product.name} vào giỏ hàng`);
  };

  const isNew =
    new Date(product.createdAt) >
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const statusColors = {
    available: "bg-green-500",
    "out-of-stock": "bg-red-500",
    "coming-soon": "bg-blue-500",
  };

  return (
    <div
      className={`p-4 bg-white rounded-lg shadow-md hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 group border border-stone-200 hover:border-yellow-400 animate-fadeIn ${
        product.status !== "available" ? "opacity-70" : ""
      }`}>
      <div className="relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-115 transition-transform duration-400 group-hover:bg-black/10 border border-stone-200"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
            Không có hình ảnh
          </div>
        )}
        <span
          className={`absolute top-2 left-2 ${
            statusColors[product.status]
          } text-white text-sm px-2 py-1 rounded animate-pulse`}>
          {product.status === "available"
            ? "Có sẵn"
            : product.status === "out-of-stock"
            ? "Hết hàng"
            : "Sắp ra mắt"}
        </span>
        {isNew && (
          <span className="absolute top-10 left-2 bg-blue-500 text-white text-sm px-2 py-1 rounded animate-pulse">
            Mới
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 line-clamp-1">
        {product.name}
      </h3>
      {product.rating && (
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <HiStar
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating ?? 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
        </div>
      )}
      <p className="text-gray-600 text-base mb-2 line-clamp-2">
        {product.description || "Món ăn ngon, đang chờ bạn khám phá!"}
      </p>
      <div className="flex gap-2 mb-2">
        <Badge color="info" size="sm">
          {product.categorySlug
            .replace("-", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
        {product.tags?.map((tag) => (
          <Badge key={tag} color="info" size="sm">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="text-yellow-600 font-medium group-hover:text-yellow-700 mb-2">
        {product.price.toLocaleString("vi-VN")} VNĐ
      </p>
      {product.sold && (
        <p className="text-gray-500 text-sm mb-2">Đã bán {product.sold}+</p>
      )}
      <div className="flex justify-between gap-2 mt-4">
        <Button
          color="warning"
          size="lg"
          href={`/menu/product/${product.id}`}
          className="hover:bg-yellow-500 hover:scale-105 transition-transform duration-200 flex-1">
          <HiEye className="mr-2 h-5 w-5" />
          Xem
        </Button>
        <Button
          color="success"
          size="lg"
          onClick={handleAddToCart}
          disabled={product.status !== "available"}
          className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 transition-transform duration-200 flex-1 ${
            product.status !== "available"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}>
          <HiShoppingCart className="mr-2 h-5 w-5" />
          Thêm
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
