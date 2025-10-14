import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button, Badge, TextInput, HRTrimmed, Spinner } from "flowbite-react";
import { HiShoppingCart, HiArrowLeft } from "react-icons/hi";
import { FaStarHalf, FaStar, FaRegStar } from "react-icons/fa";
import { BsThreeDotsVertical, BsPencil, BsTrash } from "react-icons/bs";
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
import ProductReviewForm from "../../../components/review/ProductReviewForm";
import {
  createReview,
  updateReview,
  deleteReview,
} from "../../../services/review/reviewService";
import EditReviewForm from "./EditReviewForm ";
import { useAuth } from "../../../store/AuthContext";
import ConfirmDialog from "../../../components/common/ConfirmDialogProps ";
import Pagination from "../../../components/common/PaginationClient";

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

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);
  const { user } = useAuth();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 5;
  const [filter, setFilter] = useState("all");
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [userReview, setUserReview] = useState<Product["reviews"][0] | null>(
    null
  );

  const paginatedReviews = useMemo(() => {
    if (!product?.reviews) return [];
    const start = currentPage * reviewsPerPage;
    return product.reviews.slice(start, start + reviewsPerPage);
  }, [product?.reviews, currentPage]);

  /**
   * Fetch product detail
   * useCallback để tham chiếu hàm ổn định
   */
  const fetchProduct = useCallback(async () => {
    const scrollY = window.scrollY;
    setIsLoading(true);
    try {
      const res = await getMenuItemById(id!, filter);
      if (!res) {
        notify("error", "Không tìm thấy món ăn");
        setProduct(null);
        setHasReviewed(false);
        setUserReview(null);
      } else {
        setProduct(res);
        if (filter === "all") {
          const userHasReviewed = res.reviews.some(
            (r) => r.userId === user?.publicId
          );
          setHasReviewed(userHasReviewed);
          if (userHasReviewed) {
            const foundReview = res.reviews.find(
              (r) => r.userId === user?.publicId
            );
            setUserReview(foundReview || null);
          }
        }
      }
    } catch {
      notify("error", "Không thể tải thông tin món ăn");
      setHasReviewed(false);
      setUserReview(null);
    } finally {
      setIsLoading(false);
    }
    window.scrollTo(0, scrollY);
  }, [id, filter, notify, user?.publicId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    setCurrentPage(0);
  }, [product?.reviews]);

  const handleDelete = async () => {
    if (!selectedReviewId) return;
    try {
      await deleteReview(selectedReviewId);

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.filter((r) => r.id !== selectedReviewId),
            }
          : prev
      );
      setHasReviewed(false);
      setUserReview(null);
      notify("success", "Đã xóa đánh giá");
    } catch (err) {
      notify("error", "Không thể xóa đánh giá");
      console.error(err);
    } finally {
      setOpenConfirm(false);
      setIsDropdownOpen(null);
      setSelectedReviewId(null);
    }
  };

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

  // const userReview = useMemo(() => {
  //   if (!product?.reviews || !user) return null;
  //   return product.reviews.find((r) => r.userId === user.publicId) ?? null;
  // }, [product?.reviews, user]);

  // Hàm tạo màu gradient từ chuỗi
  const getRandomGradient = (str: string) => {
    const colors = [
      "from-green-400 to-teal-500",
      "from-purple-400 to-pink-500",
      "from-blue-400 to-indigo-500",
      "from-yellow-400 to-orange-500",
      "from-red-400 to-pink-500",
      "from-cyan-400 to-blue-500",
    ];
    // Tạo index từ hash chuỗi
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

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

        {/* Form viết review */}
        {user ? (
          hasReviewed ? (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium shadow-sm">
              <p>
                ✅ Bạn đã đánh giá món này vào{" "}
                <strong>
                  {userReview?.createdAt
                    ? new Date(userReview.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </strong>
              </p>
              {userReview && (
                <>
                  <p className="mt-2 italic text-gray-700">
                    “{userReview.comment}”
                  </p>
                  <p className="mt-1 text-yellow-500">
                    {Array.from({ length: userReview.rating }).map((_, i) => (
                      <FaStar key={i} className="inline h-4 w-4" />
                    ))}
                  </p>
                </>
              )}
            </div>
          ) : (
            <ProductReviewForm
              productId={product.id}
              onSubmit={async ({ rating, comment }) => {
                try {
                  const newReview = await createReview(product.id, {
                    rating,
                    comment,
                  });
                  if (newReview) {
                    setProduct((prev) =>
                      prev
                        ? {
                            ...prev,
                            reviews: [
                              {
                                ...newReview,
                                userAvatar: newReview.userAvatar ?? null,
                                id: newReview.id ?? 0,
                              },
                              ...prev.reviews,
                            ],
                          }
                        : prev
                    );
                    setHasReviewed(true);
                    setUserReview({
                      ...newReview,
                      userAvatar: newReview.userAvatar ?? null,
                      id: newReview.id ?? 0,
                    });
                  }
                  notify("success", "Đã gửi đánh giá");
                } catch (err: unknown) {
                  if (err instanceof AxiosError) {
                    if (
                      err.response?.status === 400 &&
                      err.response?.data?.message
                    ) {
                      notify("error", err.response.data.message);
                    } else {
                      notify("error", "Gửi đánh giá thất bại");
                    }
                  } else {
                    notify("error", "Gửi đánh giá thất bại");
                  }
                }
              }}
            />
          )
        ) : (
          <p className="text-gray-500 mt-6 italic">
            Vui lòng đăng nhập để viết đánh giá.
          </p>
        )}

        {/* Reviews */}
        {product && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-stone-300">
              <h2 className="text-3xl font-bold text-gray-800">
                Đánh giá của khách hàng
              </h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="all">Tất cả</option>
                <option value="positive">Tích cực (≥4★)</option>
                <option value="neutral">Trung lập (3★)</option>
                <option value="negative">Tiêu cực (≤2★)</option>
              </select>
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

            {/* Nếu không có review trong filter hiện tại */}
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="text-center text-gray-500 italic py-6">
                Không có đánh giá nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-4 border border-stone-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start gap-3">
                        {/* PHẦN AVATAR (GIỮ NGUYÊN) */}
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-10 h-10 rounded-full object-cover border border-green-500/50"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm bg-gradient-to-r ${getRandomGradient(
                              review.userName ?? "U"
                            )}`}>
                            {review.userName?.charAt(0) ?? "U"}
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            {/* PHẦN TÊN VÀ RATING (GIỮ NGUYÊN) */}
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

                            <div className="flex items-center gap-2 relative">
                              {/* NGÀY TẠO (GIỮ NGUYÊN) */}
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>

                              {/* NÚT 3 CHẤM (THÊM MỚI) */}
                              {/* Thêm điều kiện chỉ hiển thị nếu đây là review của người dùng hiện tại */}
                              {user?.publicId === review.userId && (
                                <button
                                  className={`text-gray-500 hover:text-gray-900 p-1 rounded-full transition ${
                                    editingReviewId === review.id
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-stone-100"
                                  }`}
                                  disabled={editingReviewId === review.id}
                                  onClick={() =>
                                    setIsDropdownOpen(
                                      isDropdownOpen === review.id
                                        ? null
                                        : review.id
                                    )
                                  }>
                                  <BsThreeDotsVertical className="w-4 h-4" />
                                </button>
                              )}

                              {/* DROPDOWN MENU */}
                              {isDropdownOpen === review.id && (
                                <div
                                  className="absolute right-0 top-full mt-2 w-40 bg-white border border-stone-200 rounded-lg shadow-xl z-10 overflow-hidden"
                                  // Thêm onBlur handler để đóng menu khi click ra ngoài (cần thêm ref hoặc logic bên ngoài để hoạt động tốt)
                                >
                                  <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                    onClick={() => {
                                      setEditingReviewId(review.id);
                                      setIsDropdownOpen(null); // Đóng dropdown sau khi chọn
                                    }}>
                                    <BsPencil className="w-4 h-4 mr-2" />
                                    Sửa
                                  </button>
                                  <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                                    onClick={() => {
                                      setSelectedReviewId(review.id);
                                      setOpenConfirm(true);
                                    }}>
                                    <BsTrash className="w-4 h-4 mr-2" />
                                    Xóa
                                  </button>
                                  <ConfirmDialog
                                    open={openConfirm}
                                    title="Xóa đánh giá"
                                    message="Bạn có chắc chắn muốn xóa đánh giá này không?"
                                    confirmText="Xóa"
                                    cancelText="Hủy"
                                    onConfirm={handleDelete}
                                    onCancel={() => {
                                      setOpenConfirm(false);
                                      setIsDropdownOpen(null);
                                    }}
                                  />
                                </div>
                              )}
                              {/* KẾT THÚC DROPDOWN MENU */}
                            </div>
                          </div>

                          {/* PHẦN HIỂN THỊ COMMENT HOẶC FORM CHỈNH SỬA */}
                          {editingReviewId === review.id ? (
                            // FORM CHỈNH SỬA THAY THẾ COMMENT
                            <EditReviewForm
                              review={review}
                              onSave={async (updatedData: {
                                rating: number;
                                comment: string;
                              }) => {
                                try {
                                  const updated = await updateReview(
                                    review.id,
                                    updatedData
                                  );

                                  setProduct((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          reviews: prev.reviews.map((r) =>
                                            r.id === review.id
                                              ? { ...r, ...updated }
                                              : r
                                          ),
                                        }
                                      : prev
                                  );

                                  notify(
                                    "success",
                                    "Cập nhật đánh giá thành công"
                                  );
                                  setEditingReviewId(null);
                                } catch (err) {
                                  notify(
                                    "error",
                                    "Không thể cập nhật đánh giá"
                                  );
                                  console.error(err);
                                }
                              }}
                              onCancel={() => setEditingReviewId(null)}
                            />
                          ) : (
                            // HIỂN THỊ COMMENT BÌNH THƯỜNG (GIAO DIỆN CŨ)
                            <p className="mt-2 text-gray-700 text-sm bg-stone-100 p-3 rounded-md italic border border-stone-200">
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    (product.reviews?.length ?? 0) / reviewsPerPage
                  )}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetail;
