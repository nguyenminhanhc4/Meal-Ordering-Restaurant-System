import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Badge, Card, TextInput, HRTrimmed } from "flowbite-react";
import { HiShoppingCart, HiArrowLeft } from "react-icons/hi";
import { FaStarHalf, FaStar, FaRegStar } from "react-icons/fa"; // Thêm FaRegStar cho ngôi sao rỗng
import { useNotification } from "../../../components/Notification/NotificationContext";
import { AxiosError } from "axios";
import { getMenuItemById } from "../../../services/product/fetchProduct";
import type { Product } from "../../../services/product/fetchProduct";
import {
  getCurrentCart,
  createCart,
  addItemToCart,
} from "../../../services/cart/cartService";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMenuItemById(id!);
        const res = response;
        if (!response) {
          notify("error", "Không tìm thấy món ăn");
          setIsLoading(false);
          return;
        }
        setProduct(res);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          notify("error", "Không thể tải thông tin món ăn");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, notify]);

  const handleAddToCart = async () => {
    if (product?.status !== "AVAILABLE") {
      notify("error", `${product?.name} hiện không có sẵn`);
      return;
    }

    try {
      const cart = await getCurrentCart().catch(() => createCart());

      const updatedCart = await addItemToCart(cart.id, {
        menuItemId: product.id,
        quantity: quantity,
      });

      notify("success", `Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
      console.log("Updated cart:", updatedCart);
    } catch (error) {
      notify("error", "Lỗi khi thêm vào giỏ hàng");
      console.error(error);
    }
  };

  const isNew =
    product &&
    new Date(product.createdAt) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const averageRating =
    product?.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : product?.rating ?? 0;

  if (isLoading) {
    return (
      <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div>
              <div className="h-10 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto text-center text-gray-500 py-12 px-4 md:px-6">
          Không tìm thấy món ăn
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto animate-fadeIn py-12 px-4 md:px-6">
        {/* Nút quay lại - Đặt ở trên cùng bên trái */}
        <Button
          href="/menu"
          size="sm"
          className="!bg-white !text-stone-700 border !border-stone-300 hover:!bg-stone-100 shadow-sm transition-all mb-8 w-fit">
          <HiArrowLeft className="h-4 w-4 mr-2" />
          Quay lại menu
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Cột 1: Hình ảnh */}
          <div className="group relative">
            {product.avatarUrl ? (
              <img
                src={product.avatarUrl}
                alt={product.name}
                className="w-full h-80 md:h-[450px] object-cover rounded-2xl shadow-xl border border-stone-200 group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-80 md:h-[450px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 shadow-lg">
                Không có hình ảnh
              </div>
            )}
            {/* Vị trí badge nổi bật trên ảnh */}
            {isNew && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 font-semibold rounded-full shadow-lg animate-pulse">
                MÓN MỚI
              </span>
            )}
          </div>

          {/* Cột 2: Thông tin sản phẩm */}
          <div>
            {/* Tên & Trạng thái */}
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-extrabold text-stone-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4 pb-2 border-b border-stone-200">
              {[...Array(5)].map((_, i) => {
                const starNumber = i + 1;
                return (
                  <span key={i}>
                    {averageRating >= starNumber ? (
                      <FaStar className="h-5 w-5 text-yellow-500" />
                    ) : averageRating >= starNumber - 0.5 ? (
                      <FaStarHalf className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <FaRegStar className="h-5 w-5 text-gray-300" />
                    )}
                  </span>
                );
              })}
              <span className="ml-3 text-gray-700 font-semibold">
                {averageRating.toFixed(1)}/5
              </span>
              <span className="ml-2 text-gray-500 text-sm">
                ({product.reviews.length} đánh giá)
              </span>
            </div>

            {/* Giá */}
            <p className="text-4xl text-green-600 font-extrabold mb-4 mt-2">
              {product?.price?.toLocaleString("vi-VN") ?? "0"} VNĐ
            </p>

            {/* Tags & Trạng thái */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge color="failure" size="sm" className="font-semibold">
                Tình trạng:{" "}
                <span
                  className={`ml-1 ${
                    product.status === "AVAILABLE"
                      ? "text-green-300"
                      : "text-red-300"
                  }`}>
                  {product.status === "AVAILABLE" ? "Còn hàng" : "Hết hàng"}
                </span>
              </Badge>
              <Badge color="warning" size="sm" className="font-semibold">
                Phân loại: {product.categoryName}
              </Badge>
              {product.tags?.map((tag) => (
                <Badge
                  key={tag}
                  color="indigo"
                  size="sm"
                  className="!bg-indigo-100 !text-indigo-800 font-medium">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Mô tả */}
            <p className="text-base text-gray-600 mb-6 border-l-4 border-yellow-400 pl-3 py-1 bg-stone-50 rounded">
              {product.description ||
                "Món ăn ngon, đang chờ bạn khám phá! Vui lòng liên hệ để biết thêm chi tiết."}
            </p>

            {/* Thông tin số lượng */}
            <p className="text-sm text-gray-500 mb-4">
              Sản phẩm còn:{" "}
              <span className="font-bold text-gray-700">
                {product.availableQuantity}
              </span>{" "}
              phần
              {product.sold && (
                <span className="ml-4">
                  Đã bán:{" "}
                  <span className="font-bold text-gray-700">
                    {product.sold}
                  </span>
                </span>
              )}
            </p>

            {/* Khu vực thêm vào giỏ hàng */}
            <div className="flex items-center gap-4 py-4 border-t border-b border-stone-200">
              {/* Bộ đếm số lượng */}
              <div className="flex items-stretch gap-0 border border-stone-300 rounded-lg overflow-hidden shadow-sm">
                <Button
                  size="sm"
                  color="light"
                  className="!rounded-none !p-3 hover:!bg-stone-200"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  -
                </Button>
                <TextInput
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuantity(
                      Math.min(
                        product.availableQuantity,
                        Math.max(1, isNaN(val) ? 1 : val)
                      )
                    );
                  }}
                  className="w-16 !p-0"
                  theme={{
                    field: {
                      input: {
                        base: "!bg-white !border-y-0 !border-x !border-stone-300 text-center !p-2 focus:!ring-0 focus:!border-stone-400 h-full",
                        colors: {
                          gray: "!bg-white !border-stone-300 !text-gray-900",
                        },
                      },
                    },
                  }}
                />
                <Button
                  size="sm"
                  color="light"
                  className="!rounded-none !p-3 hover:!bg-stone-200"
                  disabled={quantity >= product.availableQuantity}
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(product.availableQuantity, q + 1)
                    )
                  }>
                  +
                </Button>
              </div>

              {/* Nút Thêm vào giỏ hàng */}
              <Button
                color="success"
                size="xl"
                onClick={handleAddToCart}
                disabled={
                  product.status !== "AVAILABLE" ||
                  quantity > product.availableQuantity
                }
                className={`text-white !bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 shadow-lg shadow-green-300/50 transition-all duration-300 flex-1 
                  ${
                    product.status !== "AVAILABLE" ||
                    quantity > product.availableQuantity
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:scale-[1.02]"
                  }`}>
                <HiShoppingCart className="mr-2 h-6 w-6" />
                <span className="font-bold text-lg">Thêm vào giỏ hàng</span>
              </Button>
            </div>
          </div>
        </div>

        <HRTrimmed className="!bg-stone-300 w-full mt-16" />

        {/* Phần Đánh giá (REVIEW SECTION) */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            {/* Header Đánh giá */}
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-stone-300">
              <h2 className="text-3xl font-bold text-gray-800">
                Đánh giá của khách hàng
              </h2>
              <span className="text-gray-600 font-semibold">
                Tổng hợp:{" "}
                <span className="text-yellow-500 text-xl font-extrabold ml-1">
                  {averageRating.toFixed(1)}/5
                </span>
                <span className="text-sm ml-1">
                  ({product.reviews.length} đánh giá)
                </span>
              </span>
            </div>

            {/* Danh sách Đánh giá - Đã làm gọn */}
            <div className="space-y-4">
              {" "}
              {/* Giảm khoảng cách giữa các review từ space-y-6 xuống space-y-4 */}
              {product.reviews.map((review) => (
                <div // Thay Card bằng div đơn giản hơn để gọn
                  key={review.id}
                  className="bg-white p-4 border border-stone-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start gap-3">
                    {" "}
                    {/* Giảm gap từ 4 xuống 3 */}
                    {/* Avatar - Giảm kích thước */}
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover border border-green-500/50" // Giảm w/h từ 12/12 xuống 10/10
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                        {review.userName.charAt(0)}
                      </div>
                    )}
                    {/* Review content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          {/* Tên và Rating trên cùng một dòng */}
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 text-base">
                              {review.userName}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {" "}
                              {/* Giảm gap sao */}
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    // Giảm kích thước sao
                                    i < review.rating
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Ngày đánh giá */}
                        <p className="text-xs text-gray-500">
                          {" "}
                          {/* Giảm cỡ chữ */}
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>

                      {/* Comment */}
                      <p className="mt-2 text-gray-700 text-sm bg-stone-100 p-3 rounded-md italic border border-stone-200">
                        {" "}
                        {/* Giảm padding, cỡ chữ */}"{review.comment}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetail;
