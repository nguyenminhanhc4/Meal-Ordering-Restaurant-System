import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Badge, Card, TextInput, HRTrimmed } from "flowbite-react";
import { HiShoppingCart, HiArrowLeft } from "react-icons/hi";
import { FaStarHalf, FaStar } from "react-icons/fa";
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
        console.log("Fetched product:", res);
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
      // Lấy cart hiện tại, nếu chưa có thì tạo mới
      const cart = await getCurrentCart().catch(() => createCart());

      // Thêm item vào cart với quantity từ input
      const updatedCart = await addItemToCart(cart.id, {
        menuItemId: product.id,
        quantity: quantity, // lấy từ state input
      });

      notify("success", `Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
      console.log("Updated cart:", updatedCart);
    } catch (error) {
      notify("error", "Lỗi khi thêm vào giỏ hàng");
      console.error(error);
    }
  };

  // tạm tính: sản phẩm mới trong 7 ngày
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
      <section className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto text-center text-gray-500 py-12 px-4 md:px-6">
          Không tìm thấy món ăn
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto animate-fadeIn py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group">
            {product.avatarUrl ? (
              <img
                src={product.avatarUrl}
                alt={product.name}
                className="w-full h-64 md:h-96 object-cover rounded-lg border border-stone-200 group-hover:scale-105 transition-transform duration-400"
              />
            ) : (
              <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                Không có hình ảnh
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {product.name}
              </h1>
              {isNew && (
                <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded animate-pulse">
                  Mới
                </span>
              )}
              <span
                className={`text-sm px-2 py-1 rounded ${
                  product.status === "AVAILABLE" ? "bg-green-500" : "bg-red-500"
                } text-white`}>
                {product.status === "AVAILABLE" ? "Có sẵn" : "Hết hàng"}
              </span>
            </div>

            <div className="flex items-center mb-4">
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
              <span className="ml-2 text-gray-600">
                ({averageRating.toFixed(1)}/5, {product.reviews.length} đánh
                giá)
              </span>
            </div>

            <p className="text-2xl text-yellow-600 font-medium mb-4">
              {product?.price?.toLocaleString("vi-VN") ?? "0"} VNĐ
            </p>
            <p className="text-gray-600 mb-4">
              Còn{" "}
              {product.sold
                ? product.availableQuantity - product.sold
                : product.availableQuantity}{" "}
              phần
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                {/* Nút trừ */}
                <Button
                  size="sm"
                  color="gray"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  -
                </Button>

                {/* Input số lượng */}
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
                  className="w-16 text-center"
                  theme={{
                    field: {
                      input: {
                        base: "!bg-white !border-stone-300 text-center",
                        colors: {
                          gray: "!bg-white !border-stone-300 !text-gray-900 !placeholder-stone-500",
                        },
                      },
                    },
                  }}
                />

                {/* Nút cộng */}
                <Button
                  size="sm"
                  color="gray"
                  disabled={quantity >= product.availableQuantity}
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(product.availableQuantity, q + 1)
                    )
                  }>
                  +
                </Button>
              </div>
              <Button
                color="success"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.status !== "AVAILABLE"}
                className={`text-white !bg-gradient-to-r !from-green-600 !to-green-700 hover:!from-green-700 hover:!to-green-800 hover:scale-105 transition-transform duration-200 flex-1 ${
                  product.status !== "AVAILABLE"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}>
                <HiShoppingCart className="mr-2 h-5 w-5" />
                Thêm vào giỏ hàng
              </Button>
            </div>

            <div className="flex gap-2 mb-4">
              <Badge color="warning" size="sm">
                {product.categoryName}
              </Badge>
              {product.tags?.map((tag) => (
                <Badge key={tag} color="info" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="text-base text-gray-600">
              {product.description || "Món ăn ngon, đang chờ bạn khám phá!"}
            </p>
          </div>
          <Button
            href="/menu"
            size="sm"
            className="!bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 
             text-white shadow-md flex items-center gap-2">
            <HiArrowLeft className="h-4 w-4" />
            Quay lại menu
          </Button>
        </div>

        <HRTrimmed className="!bg-amber-900 w-3/4" />

        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Đánh giá</h2>
              <span className="text-gray-600 text-sm">
                Trung bình:{" "}
                <span className="text-yellow-500 font-semibold">
                  {averageRating.toFixed(1)}/5
                </span>{" "}
                ({product.reviews.length} đánh giá)
              </span>
            </div>

            {/* Reviews list */}
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <Card
                  key={review.id}
                  className="!bg-white border !border-stone-200 shadow-sm rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {review.userName.charAt(0)}
                      </div>
                    )}

                    {/* Review content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-900">
                            {review.userName}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>

                      {/* Comment */}
                      <p className="mt-3 text-gray-700 bg-stone-50 p-3 rounded-lg">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetail;
