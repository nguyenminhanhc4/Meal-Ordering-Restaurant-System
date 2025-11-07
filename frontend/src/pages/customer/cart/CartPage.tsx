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
  getOrCreateCart,
  updateCartItem,
  deleteCartItems,
  getCurrentCart,
} from "../../../services/cart/cartService";
import {
  deleteCartCombos,
  clearCartCombos,
  updateCartCombo,
} from "../../../services/cart/comboCartService";
import type { Cart, CartItem } from "../../../services/cart/cartService";
import type { CartComboItem } from "../../../services/cart/comboCartService";
import { useNotification } from "../../../components/Notification/NotificationContext";
import ConfirmDialog from "../../../components/common/ConfirmDialogProps";
import { checkoutCart } from "../../../services/order/checkoutService";
import type { OrderDto } from "../../../services/types/OrderType";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../store/CartContext";
import { connectWebSocket } from "../../../api/websocketClient";
import { getMenuItemById } from "../../../services/product/fetchProduct";
import { useTranslation } from "react-i18next";
import { useRealtimeUpdate } from "../../../api/useRealtimeUpdate";
import { useAuth } from "../../../store/AuthContext";

const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  const [cartUpdated, setCartUpdated] = useState<number>(0);
  const [showAllItems, setShowAllItems] = useState(false);
  const ITEMS_TO_SHOW = 5;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<number[]>([]);
  const { fetchCart } = useCart();
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const data = await getOrCreateCart();
        setCart(data);
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, [cartUpdated, t]);

  useEffect(() => {
    if (!cart?.items?.length) return;

    const clients = cart.items.map((item) =>
      connectWebSocket<{ menuItemId: number }>(
        `/topic/menu/${item.menuItemId}`,
        async (message) => {
          console.log(t("cart.realtimeUpdate"), message.menuItemId);
          try {
            const updated = await getMenuItemById(message.menuItemId);
            setCart((prev) => {
              if (!prev) return prev;
              const updatedItems = prev.items?.map((it) =>
                it.menuItemId === message.menuItemId
                  ? {
                      ...it,
                      status: updated?.status ?? it.status,
                      price: updated?.price ?? it.price,
                      availableQuantity:
                        updated?.availableQuantity ?? it.availableQuantity,
                    }
                  : it
              );
              return { ...prev, items: updatedItems };
            });
          } catch (err) {
            console.error(t("cart.realtimeError"), err);
          }
        }
      )
    );

    return () => {
      clients.forEach((client) => client.deactivate());
    };
  }, [cart?.items, t]);

  useRealtimeUpdate(
    `/topic/menu/update`,
    getMenuItemById,
    (updatedProduct) => {
      if (!updatedProduct) return;

      // Cập nhật lại giỏ hàng: thay đổi thông tin của món tương ứng
      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items?.map((item) =>
          item.menuItemId === updatedProduct.id
            ? {
                ...item,
                status: updatedProduct.status ?? item.status,
                price: updatedProduct.price ?? item.price,
                availableQuantity:
                  updatedProduct.availableQuantity ?? item.availableQuantity,
              }
            : item
        );
        return { ...prev, items: updatedItems };
      });

      // Thông báo realtime
      notify(
        "info",
        t("mealPage.notification.itemUpdated", { name: updatedProduct.name })
      );
    },
    (msg: { menuItemId: number }) => msg.menuItemId
  );

  useRealtimeUpdate(
    `/topic/cart/${user?.publicId}`,
    async () => await getCurrentCart(),
    (updatedCart) => {
      console.log("🛒 Cart updated realtime:", updatedCart);
      setCart(updatedCart);
      notify("info", t("cart.realtimeCartUpdated"));
    },
    () => user?.publicId
  );

  const handleUpdateQuantity = async (
    itemId: number,
    newQuantity: number,
    availableQuantity?: number,
    isCombo?: boolean
  ) => {
    if (newQuantity < 1) {
      notify("error", t("cart.quantityMin"));
      return;
    }
    if (availableQuantity !== undefined && newQuantity > availableQuantity) {
      notify("error", t("cart.quantityMax", { qty: availableQuantity }));
      return;
    }

    console.log(isCombo);

    try {
      if (isCombo) {
        await updateCartCombo(itemId, newQuantity);
      } else {
        await updateCartItem(itemId, newQuantity);
      }

      setCartUpdated((prev) => prev + 1);
      notify("success", t("cart.updateSuccess"));
      await fetchCart();
    } catch (err) {
      notify("error", t("cart.updateFail"));
    }
  };

  const handleRemoveItem = async (itemIds: number[]) => {
    try {
      await deleteCartItems({ itemIds });
      setCartUpdated((prev) => prev + 1);
      setSelectedItems([]);
      notify("success", t("cart.removeSuccess"));
      await fetchCart();
    } catch (err) {
      notify("error", t("cart.removeFail"));
    }
  };

  const handleClearCart = async () => {
    if (!cart) return;
    try {
      await deleteCartItems({ cartId: cart.id });
      setCartUpdated((prev) => prev + 1);
      setSelectedItems([]);
      notify("success", t("cart.clearSuccess"));
      await fetchCart();
    } catch (err) {
      notify("error", t("cart.clearFail"));
    }
  };

  const handleRemoveCombo = async (comboIds: number[]) => {
    try {
      await deleteCartCombos({ comboIds });
      setCartUpdated((prev) => prev + 1);
      setSelectedCombos([]);
      notify("success", t("cart.removeComboSuccess"));
      await fetchCart();
    } catch (err) {
      notify("error", t("cart.removeComboFail"));
    }
  };

  const handleClearCombos = async () => {
    if (!cart) return;
    try {
      await clearCartCombos(cart.id);
      setCartUpdated((prev) => prev + 1);
      setSelectedCombos([]);
      notify("success", t("cart.clearComboSuccess"));
      await fetchCart();
    } catch (err) {
      notify("error", t("cart.clearComboFail"));
    }
  };

  const handleCheckout = useCallback(async () => {
    if (!cart) return;
    try {
      const order: OrderDto = await checkoutCart(cart);
      notify(
        "success",
        t("cart.checkoutSuccess", { publicId: order.publicId })
      );
      navigate(`/orders/${order.publicId}/payment`);
    } catch (err) {
      notify("error", t("cart.checkoutFail"));
    }
  }, [cart, navigate, notify, t]);

  const toggleSelectItem = useCallback((itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const toggleSelectCombo = useCallback((comboId: number) => {
    setSelectedCombos((prev) =>
      prev.includes(comboId)
        ? prev.filter((id) => id !== comboId)
        : [...prev, comboId]
    );
  }, []);

  // const calculateTotal = (items?: CartItem[]): string => {
  //   if (!items) return "0.00";
  //   const total = items.reduce(
  //     (sum, item) =>
  //       item.status === "AVAILABLE"
  //         ? sum + item.quantity * (item.price || 0)
  //         : sum,
  //     0
  //   );
  //   return total.toLocaleString("vi-VN", {
  //     style: "currency",
  //     currency: "VND",
  //   });
  // };

  const calculateTotalItems = (
    items?: CartItem[],
    combos?: CartComboItem[]
  ): number => {
    const itemCount = (items ?? []).reduce(
      (sum, item) => (item.status === "AVAILABLE" ? sum + item.quantity : sum),
      0
    );

    const comboCount = (combos ?? []).reduce(
      (sum, combo) =>
        combo.status === "AVAILABLE" ? sum + combo.quantity : sum,
      0
    );

    return itemCount + comboCount;
  };

  const isCartValid = (items?: CartItem[]): boolean => {
    if (!items) return false;
    return items.every(
      (item) =>
        item.status === "AVAILABLE" &&
        item.quantity <= (item.availableQuantity || Infinity)
    );
  };

  const availableItems =
    cart?.items?.filter((item) => item.status === "AVAILABLE") || [];

  const visibleItems = cart?.items
    ? showAllItems
      ? cart.items
      : cart.items.slice(0, ITEMS_TO_SHOW)
    : [];
  const hasMoreItems = cart?.items && cart.items.length > ITEMS_TO_SHOW;

  const openConfirmDialog = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner size="xl" className="text-amber-500" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );

  return (
    <section className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto max-w-8xl py-12 px-4 md:px-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-amber-800">
          {t("cart.title")}
        </h1>

        {cart?.status === "OPEN" &&
        ((cart?.items?.length ?? 0) > 0 || (cart?.combos?.length ?? 0) > 0) ? (
          <Card className="shadow-lg border-none !bg-white/90 backdrop-blur-sm">
            {cart.items && cart.items.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-amber-700 mb-4">
                  {t("cart.menuItems")}
                </h2>
                <Table hoverable striped className="rounded-lg">
                  <TableHead>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      <Checkbox className="mx-auto !bg-white" disabled />
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.image")}
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.itemName")}
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.quantity")}
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.price")}
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.actions")}
                    </TableHeadCell>
                  </TableHead>

                  <TableBody className="divide-y">
                    {visibleItems.map((item) => (
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
                            content={
                              item.description || t("cart.noDescription")
                            }
                            placement="top">
                            <span>
                              {item.menuItemName} (
                              {item.categoryName || t("cart.noCategory")})
                            </span>
                          </Tooltip>
                          {item.status === "OUT_OF_STOCK" && (
                            <Badge color="failure" className="mt-2">
                              {t("cart.outOfStock")}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="flex justify-center items-center translate-y-1/4 gap-2">
                          <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-full overflow-hidden w-max">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id,
                                  item.quantity - 1,
                                  item.availableQuantity,
                                  false
                                )
                              }
                              disabled={
                                item.quantity <= 1 ||
                                item.status === "OUT_OF_STOCK"
                              }
                              className="flex items-center justify-center w-8 h-8 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 disabled:opacity-50">
                              <HiMinus className="h-4 w-4 text-stone-800" />
                            </button>

                            <span className="w-10 text-center font-medium text-gray-700">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id,
                                  item.quantity + 1,
                                  item.availableQuantity,
                                  false
                                )
                              }
                              disabled={item.status === "OUT_OF_STOCK"}
                              className="flex items-center justify-center w-8 h-8 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 disabled:opacity-50">
                              <HiPlus className="h-4 w-4 text-stone-800" />
                            </button>
                          </div>
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
                              openConfirmDialog(
                                t("cart.confirmRemoveItem", {
                                  name: item.menuItemName,
                                }),
                                () => handleRemoveItem([item.id])
                              )
                            }>
                            <HiTrash className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {hasMoreItems && (
                  <div className="mt-2 text-center">
                    <Button
                      size="sm"
                      color="gray"
                      onClick={() => setShowAllItems(!showAllItems)}>
                      {showAllItems
                        ? t("cart.collapseList")
                        : t("cart.viewMore", {
                            count: availableItems.length - ITEMS_TO_SHOW,
                          })}
                    </Button>
                  </div>
                )}
              </div>
            )}
            {cart.combos && cart.combos.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-amber-700 mb-4">
                  {t("cart.combos")}
                </h2>

                <Table hoverable striped className="rounded-lg">
                  <TableHead>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      <Checkbox className="mx-auto !bg-white" disabled />
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.image")}
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.comboName")}
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.quantity")}
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.price")}
                    </TableHeadCell>
                    <TableHeadCell className="text-center !bg-amber-100 !text-gray-700">
                      {t("cart.actions")}
                    </TableHeadCell>
                  </TableHead>

                  <TableBody>
                    {cart.combos.map((combo) => (
                      <TableRow
                        key={combo.id}
                        className={`!bg-white hover:!bg-amber-50 transition-colors duration-200 ${
                          combo.status === "OUT_OF_STOCK" ? "opacity-50" : ""
                        }`}>
                        {/* Checkbox chọn combo */}
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedCombos.includes(combo.id)}
                            onChange={() => toggleSelectCombo(combo.id)}
                            className="mx-auto !bg-white"
                          />
                        </TableCell>

                        {/* Ảnh combo */}
                        <TableCell className="text-center py-4">
                          <img
                            src={combo.avatarUrl || "/default-combo.jpg"}
                            alt={combo.comboName}
                            className="w-20 h-20 object-cover rounded-lg shadow-sm mx-auto"
                          />
                        </TableCell>

                        {/* Thông tin combo */}
                        <TableCell className="font-medium text-center !text-gray-800">
                          {combo.comboName}{" "}
                          <Badge color="info" className="ml-2">
                            {combo.categoryName}
                          </Badge>
                          {combo.status === "OUT_OF_STOCK" && (
                            <Badge color="failure" className="ml-2">
                              {t("cart.outOfStock")}
                            </Badge>
                          )}
                          <p className="text-sm text-gray-500">
                            {combo.description}
                          </p>
                          <ul className="text-left mt-2 text-sm text-gray-600">
                            {combo.items.map((ci) => (
                              <li key={ci.id}>
                                • {ci.name} × {ci.quantity} —{" "}
                                {ci.price.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                              </li>
                            ))}
                          </ul>
                        </TableCell>

                        {/* Nút tăng giảm số lượng combo */}
                        <TableCell className="flex justify-center items-center translate-y-1/4 gap-2">
                          <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-full overflow-hidden w-max">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  combo.id,
                                  combo.quantity - 1,
                                  undefined,
                                  true
                                )
                              }
                              disabled={
                                combo.quantity <= 1 ||
                                combo.status === "OUT_OF_STOCK"
                              }
                              className="flex items-center justify-center w-8 h-8 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 disabled:opacity-50">
                              <HiMinus className="h-4 w-4 text-stone-800" />
                            </button>

                            <span className="w-10 text-center font-medium text-gray-700">
                              {combo.quantity}
                            </span>

                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  combo.id,
                                  combo.quantity + 1,
                                  undefined,
                                  true
                                )
                              }
                              disabled={combo.status === "OUT_OF_STOCK"}
                              className="flex items-center justify-center w-8 h-8 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 disabled:opacity-50">
                              <HiPlus className="h-4 w-4 text-stone-800" />
                            </button>
                          </div>
                        </TableCell>

                        {/* Giá combo */}
                        <TableCell className="text-center !text-gray-800">
                          {(combo.price * combo.quantity).toLocaleString(
                            "vi-VN",
                            {
                              style: "currency",
                              currency: "VND",
                            }
                          )}
                        </TableCell>

                        {/* Nút xóa combo */}
                        <TableCell className="flex justify-center translate-y-1/4">
                          <Button
                            color="failure"
                            size="sm"
                            className="!text-white !bg-red-500 hover:!bg-red-600"
                            onClick={() =>
                              openConfirmDialog(
                                t("cart.confirmRemoveCombo", {
                                  name: combo.comboName,
                                }),
                                () => handleRemoveCombo([combo.id])
                              )
                            }>
                            <HiTrash className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              <div className="flex gap-2">
                <Button
                  color="red"
                  size="sm"
                  onClick={() => {
                    if (
                      selectedItems.length === 0 &&
                      selectedCombos.length === 0
                    )
                      return;
                    openConfirmDialog(
                      t("cart.confirmRemoveSelected", {
                        count: selectedItems.length + selectedCombos.length,
                      }),
                      async () => {
                        if (selectedItems.length > 0)
                          await handleRemoveItem(selectedItems);
                        if (selectedCombos.length > 0)
                          await handleRemoveCombo(selectedCombos);
                      }
                    );
                  }}
                  disabled={
                    selectedItems.length === 0 && selectedCombos.length === 0
                  }>
                  {t("cart.removeSelected")}
                </Button>

                <Button
                  color="red"
                  size="sm"
                  onClick={() =>
                    openConfirmDialog(t("cart.confirmClear"), async () => {
                      const tasks = [];
                      if (cart.items && cart.items.length > 0)
                        tasks.push(handleClearCart());
                      if (cart.combos && cart.combos.length > 0)
                        tasks.push(handleClearCombos());
                      if (tasks.length > 0) await Promise.all(tasks);
                    })
                  }
                  disabled={
                    (!cart.items || cart.items.length === 0) &&
                    (!cart.combos || cart.combos.length === 0)
                  }>
                  {t("cart.clearAll")}
                </Button>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-gray-600">
                <p className="text-lg">
                  {t("cart.totalItems")}:{" "}
                  <span className="font-semibold">
                    {calculateTotalItems(cart.items, cart.combos)}
                  </span>
                </p>
                <p className="text-lg">
                  {t("cart.totalPrice")}:{" "}
                  <span className="font-semibold text-amber-600">
                    {cart.totalAmount?.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }) || "0 ₫"}
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  color="gray"
                  size="lg"
                  className="!text-white bg-gray-500 hover:bg-gray-600 transition-colors duration-200"
                  href="/menu">
                  {t("cart.backToMenu")}
                </Button>

                <Button
                  color="success"
                  size="lg"
                  className="!text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 transition-transform duration-200"
                  disabled={!isCartValid(cart.items)}
                  onClick={handleCheckout}>
                  {t("cart.checkout")}
                </Button>
              </div>
            </div>
          </Card>
        ) : cart ? (
          <Card className="shadow-lg border-none !bg-white/90 backdrop-blur-sm text-center py-12">
            <HiShoppingCart className="mx-auto h-16 w-16 !text-gray-400" />
            <p className="text-xl text-gray-500 mt-4">{t("cart.empty")}</p>
            <Button
              color="primary"
              className="mt-6 mx-auto text-white !bg-amber-500 hover:!bg-amber-600"
              href="/menu">
              {t("cart.viewMenu")}
            </Button>
          </Card>
        ) : (
          // ⏳ Đang load cart
          <div className="text-center py-12 text-gray-500">
            <Spinner size="lg" className="mx-auto mb-4" />
            {t("cart.loading")}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("cart.confirmTitle")}
        message={confirmMessage}
        confirmText={t("cart.confirm")}
        cancelText={t("cart.cancel")}
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
