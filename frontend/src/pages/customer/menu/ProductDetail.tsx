import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button, Badge, TextInput, HRTrimmed, Spinner } from "flowbite-react";
import { HiShoppingCart, HiArrowLeft } from "react-icons/hi";
import { FaStarHalf, FaStar, FaRegStar } from "react-icons/fa";
import { useNotification } from "../../../components/Notification/NotificationContext";
import { AxiosError } from "axios";
import { getMenuItemById } from "../../../services/product/fetchProduct";
import type { Product } from "../../../services/product/fetchProduct";
import { useCart } from "../../../store/CartContext";
import {
  getCurrentCart,
  createCart,
  addItemToCart,
} from "../../../services/cart/cartService";

/**
 * ProductDetail
 * - Load chi tiết món ăn
 * - Hiển thị rating, tags, mô tả
 * - Thêm vào giỏ hàng (validate & prevent double-click)
 */
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const { fetchCart } = useCart();

  const { notify } = useNotification();

  /**
   * Fetch product detail
   * useCallback để tham chiếu hàm ổn định
   */
  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMenuItemById(id!);
      if (!res) {
        notify("error", "Không tìm thấy món ăn");
        setProduct(null);
      } else {
        setProduct(res);
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        notify("error", "Không thể tải thông tin món ăn");
      } else {
        notify("error", "Lỗi khi tải thông tin");
      }
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  /**
   * isNew, averageRating được memo hoá để tránh tính lại mỗi render
   */
  const isNew = useMemo(() => {
    if (!product?.createdAt) return false;
    return (
      new Date(product.createdAt) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
  }, [product]);

  const averageRating = useMemo(() => {
    if (!product) return 0;
    if (product.reviews && product.reviews.length > 0) {
      return (
        product.reviews.reduce((s, r) => s + r.rating, 0) /
        product.reviews.length
      );
    }
    return product.rating ?? 0;
  }, [product]);

  /**
   * Thêm vào giỏ hàng
   * - validate trạng thái + số lượng
   * - prevent double click bằng addingToCart
   * - đảm bảo có cart (tạo nếu cần)
   */
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    const availableQty = product.availableQuantity ?? 0;
    if (product.status !== "AVAILABLE") {
      notify("error", `${product.name} hiện không có sẵn`);
      return;
    }
    if (quantity < 1 || quantity > availableQty) {
      notify("error", `Số lượng không hợp lệ (tối đa ${availableQty})`);
      return;
    }
    if (addingToCart) return; // prevent double submit

    setAddingToCart(true);
    try {
      // Lấy cart hiện tại hoặc tạo mới
      let cart = null;
      try {
        cart = await getCurrentCart();
      } catch {
        cart = await createCart();
      }
      if (!cart || !cart.id) {
        // fallback an toàn
        const created = await createCart();
        cart = created;
      }

      await addItemToCart(cart.id, { menuItemId: product.id, quantity });
      await fetchCart();
      notify("success", `Đã thêm ${quantity} × ${product.name} vào giỏ hàng`);
    } catch (err) {
      notify("error", "Lỗi khi thêm vào giỏ hàng");
      console.error("add to cart error:", err);
    } finally {
      setAddingToCart(false);
    }
  }, [product, quantity, addingToCart, notify]);

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full h-96 bg-gray-200 rounded-2xl animate-pulse" />
            <div>
              <div className="h-10 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-16 bg-gray-200 rounded mb-4 animate-pulse" />
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

  const availableQty = product.availableQuantity ?? 0;

  return (
    <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto animate-fadeIn py-12 px-4 md:px-6">
        <Button
          href="/menu"
          size="sm"
          className="!bg-white !text-stone-700 border !border-stone-300 hover:!bg-stone-100 shadow-sm transition-all mb-8 w-fit"
          aria-label="Quay lại menu">
          <HiArrowLeft className="h-4 w-4 mr-2" />
          Quay lại menu
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* ảnh */}
          <div className="group relative">
            {product.avatarUrl && !imgError ? (
              <img
                src={product.avatarUrl}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-80 md:h-[450px] object-cover rounded-2xl shadow-xl border border-stone-200 group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-80 md:h-[450px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 shadow-lg">
                Không có hình ảnh
              </div>
            )}

            {isNew && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 font-semibold rounded-full shadow-lg animate-pulse">
                MÓN MỚI
              </span>
            )}
          </div>

          {/* thông tin */}
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-extrabold text-stone-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* rating */}
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
                ({product.reviews?.length ?? 0} đánh giá)
              </span>
            </div>

            <p className="text-4xl text-green-600 font-extrabold mb-4 mt-2">
              {product?.price?.toLocaleString("vi-VN") ?? "0"} VNĐ
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                color={product.status === "AVAILABLE" ? "success" : "failure"}
                size="sm"
                className="font-semibold">
                Tình trạng:{" "}
                <span
                  className={
                    product.status === "AVAILABLE"
                      ? "text-green-800"
                      : "text-red-800"
                  }>
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

            <p className="text-base text-gray-600 mb-6 border-l-4 border-yellow-400 pl-3 py-1 bg-stone-50 rounded">
              {product.description ||
                "Món ăn ngon, đang chờ bạn khám phá! Vui lòng liên hệ để biết thêm chi tiết."}
            </p>

            <p className="text-sm text-gray-500 mb-4">
              Sản phẩm còn:{" "}
              <span className="font-bold text-gray-700">{availableQty}</span>{" "}
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

            {/* add to cart area */}
            <div className="flex items-center gap-4 py-4 border-t border-b border-stone-200">
              <div className="flex items-stretch gap-0 border border-stone-300 rounded-lg overflow-hidden shadow-sm">
                <Button
                  size="sm"
                  color="light"
                  className="!rounded-none !p-3 hover:!bg-stone-200"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Giảm số lượng">
                  -
                </Button>

                <TextInput
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuantity(
                      Math.min(
                        availableQty,
                        Math.max(1, isNaN(val) ? 1 : Math.floor(val))
                      )
                    );
                  }}
                  min={1}
                  max={availableQty}
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
                  disabled={quantity >= availableQty}
                  onClick={() =>
                    setQuantity((q) => Math.min(availableQty, q + 1))
                  }
                  aria-label="Tăng số lượng">
                  +
                </Button>
              </div>

              <Button
                color="success"
                size="xl"
                onClick={handleAddToCart}
                disabled={
                  product.status !== "AVAILABLE" ||
                  quantity > availableQty ||
                  addingToCart
                }
                className={`text-white !bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 shadow-lg shadow-green-300/50 transition-all duration-300 flex-1 ${
                  product.status !== "AVAILABLE" || quantity > availableQty
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:scale-[1.02]"
                }`}
                aria-label={`Thêm ${quantity} ${product.name} vào giỏ hàng`}>
                <HiShoppingCart className="mr-2 h-6 w-6" />
                {addingToCart ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Đang thêm...
                  </span>
                ) : (
                  <span className="font-bold text-lg">Thêm vào giỏ hàng</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <HRTrimmed className="!bg-stone-300 w-full mt-16" />

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
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

            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white p-4 border border-stone-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start gap-3">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover border border-green-500/50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                        {review.userName?.charAt(0) ?? "U"}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 text-base">
                            {review.userName}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>

                      <p className="mt-2 text-gray-700 text-sm bg-stone-100 p-3 rounded-md italic border border-stone-200">
                        "{review.comment}"
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
