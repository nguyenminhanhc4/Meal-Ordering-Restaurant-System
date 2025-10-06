/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Table,
  Spinner,
  TableHead,
  TableCell,
  TableHeadCell,
  TableBody,
  TableRow,
  Card,
  Tooltip,
  Badge,
  Checkbox,
} from "flowbite-react";
import { HiTrash, HiMinus, HiPlus, HiShoppingCart } from "react-icons/hi";
import {
  getCurrentCart,
  updateCartItem,
  deleteCartItems,
} from "../../../services/cart/cartService";
import type { Cart, CartItem } from "../../../services/cart/cartService";
import { useNotification } from "../../../components/Notification/NotificationContext";
import ConfirmDialog from "../../../components/common/ConfirmDialogProps ";
import { checkoutCart } from "../../../services/order/checkoutService";
import type { OrderDto } from "../../../services/types/OrderType";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  /** State quản lý giỏ hàng */
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cartUpdated, setCartUpdated] = useState<number>(0);

  /** State xác nhận xóa */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState<string>("");

  /** State lưu các item đã chọn */
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { notify } = useNotification();
  const navigate = useNavigate();

  /** Fetch giỏ hàng mỗi khi cartUpdated thay đổi */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCurrentCart();
        setCart(data);
      } catch (err) {
        setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [cartUpdated]);

  /**
   * Cập nhật số lượng món
   */
  const handleUpdateQuantity = async (
    itemId: number,
    newQuantity: number,
    availableQuantity?: number
  ) => {
    if (newQuantity < 1) {
      notify("error", "Số lượng phải lớn hơn 0.");
      return;
    }
    if (availableQuantity !== undefined && newQuantity > availableQuantity) {
      notify("error", `Số lượng tối đa cho món này là ${availableQuantity}.`);
      return;
    }
    try {
      await updateCartItem(itemId, newQuantity);
      setCartUpdated((prev) => prev + 1);
      notify("success", "Cập nhật số lượng thành công!");
    } catch (err) {
      notify("error", "Cập nhật số lượng thất bại. Vui lòng thử lại.");
    }
  };

  /**
   * Xóa một hoặc nhiều món
   */
  const handleRemoveItem = async (itemIds: number[]) => {
    try {
      await deleteCartItems({ itemIds });
      setCartUpdated((prev) => prev + 1);
      setSelectedItems([]);
      notify("success", "Đã xóa khỏi giỏ hàng");
    } catch (err) {
      notify("error", "Xóa món thất bại. Vui lòng thử lại.");
    }
  };

  /** Xóa toàn bộ giỏ hàng */
  const handleClearCart = async () => {
    if (!cart) return;
    try {
      await deleteCartItems({ cartId: cart.id });
      setCartUpdated((prev) => prev + 1);
      setSelectedItems([]);
      notify("success", "Đã xóa toàn bộ giỏ hàng");
    } catch (err) {
      notify("error", "Xóa toàn bộ thất bại. Vui lòng thử lại.");
    }
  };

  /** Thanh toán giỏ hàng */
  const handleCheckout = useCallback(async () => {
    if (!cart) return;
    try {
      const order: OrderDto = await checkoutCart(cart);
      notify("success", `Đặt hàng thành công! Mã đơn: ${order.publicId}`);
      navigate(`/order`);
    } catch (err) {
      notify("error", "Đặt hàng thất bại. Vui lòng thử lại.");
    }
  }, [cart, navigate, notify]);

  /** Chọn / bỏ chọn item */
  const toggleSelectItem = useCallback((itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  /** Tính tổng tiền giỏ hàng */
  const calculateTotal = (items?: CartItem[]): string => {
    if (!items) return "0.00";
    const total = items.reduce(
      (sum, item) =>
        item.status === "AVAILABLE"
          ? sum + item.quantity * (item.price || 0)
          : sum,
      0
    );
    return total.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  /** Tính tổng số món */
  const calculateTotalItems = (items?: CartItem[]): number => {
    if (!items) return 0;
    return items.reduce(
      (sum, item) => (item.status === "AVAILABLE" ? sum + item.quantity : sum),
      0
    );
  };

  /** Kiểm tra giỏ hàng hợp lệ trước khi thanh toán */
  const isCartValid = (items?: CartItem[]): boolean => {
    if (!items) return false;
    return items.every(
      (item) =>
        item.status === "AVAILABLE" &&
        item.quantity <= (item.availableQuantity || Infinity)
    );
  };

  /** Mở dialog xác nhận xóa */
  const openConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  /** Loading */
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner size="xl" className="text-amber-500" />
      </div>
    );

  /** Error */
  if (error)
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );

  /** Render giao diện giỏ hàng */
  return (
    <section className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto max-w-8xl py-12 px-4 md:px-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-amber-800">
          Giỏ hàng của bạn
        </h1>

        {cart && cart.items && cart.items.length > 0 ? (
          <Card className="shadow-lg border-none !bg-white/90 backdrop-blur-sm">
            {/* Bảng danh sách món */}
            <Table hoverable striped className="rounded-lg">
              <TableHead>
                <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                  <Checkbox disabled />
                </TableHeadCell>
                <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                  Hình ảnh
                </TableHeadCell>
                <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                  Tên món
                </TableHeadCell>
                <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                  Số lượng
                </TableHeadCell>
                <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                  Giá
                </TableHeadCell>
                <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                  Hành động
                </TableHeadCell>
              </TableHead>

              <TableBody className="divide-y">
                {cart.items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`!bg-white hover:!bg-amber-50 transition-colors duration-200 ${
                      item.status === "OUT_OF_STOCK" ? "opacity-50" : ""
                    }`}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="mx-auto !bg-white"
                      />
                    </TableCell>

                    <TableCell className="text-center py-4">
                      <img
                        src={item.avatarUrl}
                        alt={item.menuItemName}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm mx-auto"
                      />
                    </TableCell>

                    <TableCell className="font-medium text-center !text-gray-800">
                      <Tooltip
                        content={item.description || "Không có mô tả"}
                        placement="top">
                        <span>
                          {item.menuItemName} (
                          {item.categoryName || "Không xác định"})
                        </span>
                      </Tooltip>
                      {item.status === "OUT_OF_STOCK" && (
                        <Badge color="failure" className="mt-2">
                          Hết hàng
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="flex justify-center items-center translate-y-1/4 gap-2">
                      <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-full overflow-hidden w-max">
                        {/* Nút giảm */}
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.availableQuantity
                            )
                          }
                          disabled={
                            item.quantity <= 1 || item.status === "OUT_OF_STOCK"
                          }
                          className="flex items-center justify-center w-8 h-8 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 disabled:opacity-50">
                          <HiMinus className="h-4 w-4 text-stone-800" />
                        </button>

                        <span className="w-10 text-center font-medium text-gray-700">
                          {item.quantity}
                        </span>

                        {/* Nút tăng */}
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              item.quantity + 1,
                              item.availableQuantity
                            )
                          }
                          disabled={item.status === "OUT_OF_STOCK"}
                          className="flex items-center justify-center w-8 h-8 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 disabled:opacity-50">
                          <HiPlus className="h-4 w-4 text-stone-800" />
                        </button>
                      </div>

                      {/* Thông báo còn ít hàng */}
                      {item.availableQuantity &&
                        item.quantity > item.availableQuantity && (
                          <p className="text-red-500 text-sm mt-2">
                            Chỉ còn {item.availableQuantity} món
                          </p>
                        )}
                    </TableCell>

                    <TableCell className="text-center !text-gray-800">
                      {(item.quantity * (item.price || 0)).toLocaleString(
                        "vi-VN",
                        {
                          style: "currency",
                          currency: "VND",
                        }
                      )}
                    </TableCell>

                    <TableCell className="flex justify-center translate-y-1/4">
                      <Button
                        color="failure"
                        size="sm"
                        className="!text-white !bg-red-500 hover:!bg-red-600"
                        onClick={() =>
                          openConfirm(
                            `Bạn có chắc muốn xóa "${item.menuItemName}" khỏi giỏ hàng?`,
                            () => handleRemoveItem([item.id])
                          )
                        }
                        disabled={item.status === "OUT_OF_STOCK"}>
                        <HiTrash className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Nút xóa món */}
            <div className="mt-4 flex justify-between">
              <div className="flex gap-2">
                <Button
                  color="red"
                  size="sm"
                  onClick={() =>
                    openConfirm(
                      `Bạn có chắc muốn xóa ${selectedItems.length} món đã chọn?`,
                      () => handleRemoveItem(selectedItems)
                    )
                  }
                  disabled={selectedItems.length === 0}>
                  Xóa đã chọn
                </Button>

                <Button
                  color="red"
                  size="sm"
                  onClick={() =>
                    openConfirm(
                      "Bạn có chắc muốn xóa toàn bộ giỏ hàng?",
                      handleClearCart
                    )
                  }
                  disabled={!cart.items || cart.items.length === 0}>
                  Xóa tất cả
                </Button>
              </div>
            </div>

            {/* Tổng số lượng và tổng tiền */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-gray-600">
                <p className="text-lg">
                  Tổng số món:{" "}
                  <span className="font-semibold">
                    {calculateTotalItems(cart.items)}
                  </span>
                </p>
                <p className="text-lg">
                  Tổng cộng:{" "}
                  <span className="font-semibold text-amber-600">
                    {calculateTotal(cart.items)}
                  </span>
                </p>
              </div>

              {/* Nút quay lại menu và thanh toán */}
              <div className="flex gap-3">
                <Button
                  color="gray"
                  size="lg"
                  className="!text-white bg-gray-500 hover:bg-gray-600 transition-colors duration-200"
                  href="/menu">
                  Quay lại menu
                </Button>

                <Button
                  color="success"
                  size="lg"
                  className="!text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 transition-transform duration-200"
                  disabled={!isCartValid(cart.items)}
                  onClick={handleCheckout}>
                  Đặt hàng
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          // Giỏ hàng trống
          <Card className="shadow-lg border-none !bg-white/90 backdrop-blur-sm text-center py-12">
            <HiShoppingCart className="mx-auto h-16 w-16 !text-gray-400" />
            <p className="text-xl text-gray-500 mt-4">
              Giỏ hàng của bạn đang trống
            </p>
            <Button
              color="primary"
              className="mt-6 mx-auto !bg-amber-500 hover:!bg-amber-600"
              href="/menu">
              Xem thực đơn
            </Button>
          </Card>
        )}
      </div>

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa"
        message={confirmMessage}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={() => {
          confirmAction();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
};

export default CartPage;
