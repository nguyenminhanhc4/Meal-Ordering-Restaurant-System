import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Badge, Card, TextInput } from "flowbite-react";
import { HiShoppingCart, HiStar } from "react-icons/hi";
import { mockProducts } from "../../../services/mock/mockProducts2";
import type { Product } from "../../../services/mock/mockProducts2";
import { useNotification } from "../../../components/Notification/NotificationContext";
import { AxiosError } from "axios";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    setTimeout(() => {
      try {
        const foundProduct = mockProducts.find((p) => p.id === Number(id));
        if (!foundProduct) {
          notify("error", "Không tìm thấy món ăn");
        }
        setProduct(foundProduct || null);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          notify("error", "Không thể tải thông tin món ăn");
        }
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, [id, notify]);

  const handleAddToCart = () => {
    if (!product || product.status !== "AVAILABLE" || product.quantity === 0) {
      notify("error", `${product?.name || "Món ăn"} hiện không có sẵn`);
      return;
    }
    notify("success", `Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
  };

  const isNew =
    product &&
    new Date(product.createdAt) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const averageRating =
    product && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

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
            {product.image ? (
              <img
                src={product.image}
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
            {product.reviews.length > 0 && (
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <HiStar
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  ({averageRating.toFixed(1)}/5, {product.reviews.length} đánh
                  giá)
                </span>
              </div>
            )}
            <p className="text-2xl text-yellow-600 font-medium mb-4">
              {product.price.toLocaleString("vi-VN")} VNĐ
            </p>
            <p className="text-gray-600 mb-4">
              {product.quantity > 0
                ? `Còn ${product.quantity} phần`
                : "Hết hàng"}
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={
                    product.status !== "AVAILABLE" || product.quantity === 0
                  }>
                  -
                </Button>
                <TextInput
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                  className="w-16 text-center"
                  disabled={
                    product.status !== "AVAILABLE" || product.quantity === 0
                  }
                  theme={{
                    field: {
                      input: {
                        base: "!bg-white !border-stone-300",
                        colors: {
                          gray: "!bg-white !border-stone-300 !text-gray-900 !placeholder-stone-500",
                        },
                      },
                    },
                  }}
                />
                <Button
                  size="sm"
                  color="gray"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.quantity, q + 1))
                  }
                  disabled={
                    product.status !== "AVAILABLE" || product.quantity === 0
                  }>
                  +
                </Button>
              </div>
              <Button
                color="success"
                size="lg"
                onClick={handleAddToCart}
                disabled={
                  product.status !== "AVAILABLE" || product.quantity === 0
                }
                className="text-white !bg-gradient-to-r !from-green-600 !to-green-700 hover:!from-green-700 hover:!to-green-800 hover:scale-105 transition-transform duration-200 flex-1">
                <HiShoppingCart className="mr-2 h-5 w-5" />
                Thêm vào giỏ hàng
              </Button>
            </div>
            <div className="flex gap-2 mb-4">
              <Badge color="info" size="sm">
                {product.categorySlug
                  .replace("-", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
            </div>
            <p className="text-base text-gray-600">
              {product.description || "Món ăn ngon, đang chờ bạn khám phá!"}
            </p>
          </div>
        </div>
        {product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đánh giá</h2>
            <div className="space-y-4">
              {product.reviews.map((review, index) => (
                <Card key={index} className="!bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">
                      {review.userName}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <HiStar
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
                  {review.comment && (
                    <p className="text-gray-600">{review.comment}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
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
