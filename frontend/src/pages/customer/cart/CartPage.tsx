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
import ConfirmDialog from "../../../components/common/ConfirmDialogProps";
import { checkoutCart } from "../../../services/order/checkoutService";
import type { OrderDto } from "../../../services/types/OrderType";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../store/CartContext";
import { connectWebSocket } from "../../../api/websocketClient";
import { getMenuItemById } from "../../../services/product/fetchProduct";
import { useTranslation } from "react-i18next";
import { useRealtimeUpdate } from "../../../api/useRealtimeUpdate";

const CartPage: React.FC = () => {
  const { t } = useTranslation();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cartUpdated, setCartUpdated] = useState<number>(0);
  const [showAllItems, setShowAllItems] = useState(false);
  const ITEMS_TO_SHOW = 5;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { fetchCart } = useCart();
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const data = await getCurrentCart();
        setCart(data);
      } catch (err) {
        setError(t("cart.fetchError"));
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

  const handleUpdateQuantity = async (
    itemId: number,
    newQuantity: number,
    availableQuantity?: number
  ) => {
    if (newQuantity < 1) {
      notify("error", t("cart.quantityMin"));
      return;
    }
    if (availableQuantity !== undefined && newQuantity > availableQuantity) {
      notify("error", t("cart.quantityMax", { qty: availableQuantity }));
      return;
    }
    try {
      await updateCartItem(itemId, newQuantity);
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

  const calculateTotalItems = (items?: CartItem[]): number => {
    if (!items) return 0;
    return items.reduce(
      (sum, item) => (item.status === "AVAILABLE" ? sum + item.quantity : sum),
      0
    );
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

        {cart && cart.items && cart.items.length > 0 ? (
          <Card className="shadow-lg border-none !bg-white/90 backdrop-blur-sm">
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
                        content={item.description || t("cart.noDescription")}
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

            <div className="mt-4 flex justify-between">
              <div className="flex gap-2">
                <Button
                  color="red"
                  size="sm"
                  onClick={() =>
                    openConfirmDialog(
                      t("cart.confirmRemoveSelected", {
                        count: selectedItems.length,
                      }),
                      () => handleRemoveItem(selectedItems)
                    )
                  }
                  disabled={selectedItems.length === 0}>
                  {t("cart.removeSelected")}
                </Button>

                <Button
                  color="red"
                  size="sm"
                  onClick={() =>
                    openConfirmDialog(t("cart.confirmClear"), handleClearCart)
                  }
                  disabled={!cart.items || cart.items.length === 0}>
                  {t("cart.clearAll")}
                </Button>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-gray-600">
                <p className="text-lg">
                  {t("cart.totalItems")}:{" "}
                  <span className="font-semibold">
                    {calculateTotalItems(cart.items)}
                  </span>
                </p>
                <p className="text-lg">
                  {t("cart.totalPrice")}:{" "}
                  <span className="font-semibold text-amber-600">
                    {calculateTotal(cart.items)}
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
        ) : (
          <Card className="shadow-lg border-none !bg-white/90 backdrop-blur-sm text-center py-12">
            <HiShoppingCart className="mx-auto h-16 w-16 !text-gray-400" />
            <p className="text-xl text-gray-500 mt-4">{t("cart.empty")}</p>
            <Button
              color="primary"
              className="mt-6 mx-auto !bg-amber-500 hover:!bg-amber-600"
              href="/menu">
              {t("cart.viewMenu")}
            </Button>
          </Card>
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
