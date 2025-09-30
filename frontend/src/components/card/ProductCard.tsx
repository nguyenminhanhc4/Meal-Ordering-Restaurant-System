import React from "react";
import { Button, Badge } from "flowbite-react";
import { HiEye, HiShoppingCart } from "react-icons/hi";
import { FaStar, FaStarHalf } from "react-icons/fa";
import type { Product } from "../../services/product/fetchProduct";
import { useNotification } from "../Notification/NotificationContext";
import {
  getCurrentCart,
  createCart,
  addItemToCart,
} from "../../services/cart/cartService";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { notify } = useNotification();

  const handleAddToCart = async () => {
    if (product.status !== "AVAILABLE") {
      notify("error", `${product.name} hiện không có sẵn`);
      return;
    }

    try {
      // Lấy cart hiện tại
      const cart = await getCurrentCart().catch(() => createCart());

      // Thêm item vào cart
      const updatedCart = await addItemToCart(cart.id, {
        menuItemId: product.id,
        quantity: 1,
      });

      notify("success", `Đã thêm ${product.name} vào giỏ hàng`);
      console.log("Updated cart:", updatedCart);
    } catch (error) {
      notify("error", "Lỗi khi thêm vào giỏ hàng");
      console.error(error);
    }
  };

  const averageRating =
    product?.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : product?.rating ?? 0;

  const isNew =
    new Date(product.createdAt) >
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const statusColors = {
    AVAILABLE: "bg-green-500",
    OUT_OF_STOCK: "bg-red-500",
    COMING_SOON: "bg-blue-500",
  };

  return (
    <div
      className={`p-4 bg-white rounded-lg shadow-md hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 group border border-stone-200 hover:border-yellow-400 animate-fadeIn ${
        product.status !== "AVAILABLE" ? "opacity-70" : ""
      }`}>
      <div className="relative">
        {product.avatarUrl ? (
          <img
            src={product.avatarUrl}
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
          {product.status === "AVAILABLE"
            ? "Có sẵn"
            : product.status === "OUT_OF_STOCK"
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

      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => {
          const starNumber = i + 1;
          return (
            <span key={i}>
              {averageRating >= starNumber ? (
                <FaStar className="h-5 w-5 text-yellow-400" />
              ) : averageRating >= starNumber - 0.5 ? (
                <FaStarHalf className="h-5 w-5 text-yellow-400" />
              ) : (
                <FaStar className="h-5 w-5 text-gray-300" />
              )}
            </span>
          );
        })}
        <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
      </div>

      <p className="text-gray-600 text-base mb-2 line-clamp-2">
        {product.description || "Món ăn ngon, đang chờ bạn khám phá!"}
      </p>
      <div className="flex gap-2 mb-2">
        <Badge color="warning" size="sm">
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

      <p className="text-gray-500 text-sm mb-2">Đã bán {product.sold ?? 0}+</p>

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
          disabled={product.status !== "AVAILABLE"}
          className={`text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 transition-transform duration-200 flex-1 ${
            product.status !== "AVAILABLE"
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
