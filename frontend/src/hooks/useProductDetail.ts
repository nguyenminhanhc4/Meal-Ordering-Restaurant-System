import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNotification } from "../components/Notification/NotificationContext";
import { getMenuItemById } from "../services/product/fetchProduct";
import { useRealtimeUpdate } from "../api/useRealtimeUpdate";
import { useCart } from "../store/CartContext";
import { useTranslation } from "react-i18next";
import {
  getCurrentCart,
  createCart,
  addItemToCart,
} from "../services/cart/cartService";
import axios from "axios";

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { notify } = useNotification();
  const { fetchCart } = useCart();
  const { t } = useTranslation();

  const [product, setProduct] = useState<unknown>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMenuItemById(id!);
      setProduct(res);
    } catch {
      notify("error", t("product.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [id, notify, t]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useRealtimeUpdate(`/topic/menu/${id}`, fetchProduct, () =>
    notify("info", t("product.updated")),(msg: { menuItemId: number }) => msg.menuItemId
  );

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      const cart = await getCurrentCart().catch(createCart);
      await addItemToCart(cart.id, { menuItemId: product.id, quantity });
      await fetchCart();
      notify("success", t("cart.added", { qty: quantity, name: product.name }));
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : t("cart.unknownError");
      notify("error", msg);
    } finally {
      setAddingToCart(false);
    }
  }, [product, quantity, addingToCart, notify, t]);

  return {
    product,
    setProduct,
    quantity,
    setQuantity,
    isLoading,
    addingToCart,
    handleAddToCart,
  };
};
