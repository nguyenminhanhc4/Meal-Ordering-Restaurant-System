import React, { useCallback, useState } from "react";
import { Button, TextInput, Spinner } from "flowbite-react";
import { HiShoppingCart } from "react-icons/hi";
import { useNotification } from "../../components/Notification/NotificationContext";
import { useCart } from "../../store/CartContext";
import {
  getCurrentCart,
  createCart,
  addItemToCart,
} from "../../services/cart/cartService";
import type { Product } from "../../services/product/fetchProduct";
import { useTranslation } from "react-i18next";
import axios from "axios";

interface ProductAddToCartProps {
  product: Product;
  quantity: number;
  setQuantity: (quantity: number) => void;
}

const ProductAddToCart: React.FC<ProductAddToCartProps> = ({
  product,
  quantity,
  setQuantity,
}) => {
  const { t } = useTranslation();
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const { notify } = useNotification();
  const { fetchCart } = useCart();

  const handleAddToCart = useCallback(async () => {
    const availableQty = product.availableQuantity ?? 0;
    if (product.status !== "AVAILABLE") {
      notify("error", t("product.unavailable", { name: product.name }));
      return;
    }
    if (quantity < 1 || quantity > availableQty) {
      notify("error", t("product.invalidQuantity", { qty: availableQty }));
      return;
    }
    if (addingToCart) return;

    setAddingToCart(true);
    try {
      let cart = null;
      try {
        cart = await getCurrentCart();
      } catch {
        cart = await createCart();
      }
      if (!cart || !cart.id) {
        const created = await createCart();
        cart = created;
      }

      await addItemToCart(cart.id, { menuItemId: product.id, quantity });
      await fetchCart();
      notify(
        "success",
        t("cartBTN.added", { qty: quantity, name: product.name })
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message ?? err.message;
        notify("error", msg);
      } else {
        notify("error", t("cartBTN.unknownError"));
      }
      console.error("add to cart error:", err);
    } finally {
      setAddingToCart(false);
    }
  }, [product, quantity, addingToCart, notify, t, fetchCart]);

  const availableQty = product.availableQuantity ?? 0;

  return (
    <div className="flex items-center gap-4 py-4 border-t border-b border-stone-200">
      <div className="flex items-stretch gap-0 border border-stone-300 rounded-lg overflow-hidden shadow-sm">
        <Button
          size="sm"
          color="light"
          className="!rounded-none !p-3 hover:!bg-stone-200"
          disabled={quantity <= 1}
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          aria-label={t("cartBTN.decreaseQuantity")}>
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
          onClick={() => setQuantity(Math.min(availableQty, quantity + 1))}
          aria-label={t("cartBTN.increaseQuantity")}>
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
        aria-label={t("cartBTN.addToCart", { quantity, name: product.name })}>
        <HiShoppingCart className="mr-2 h-6 w-6" />
        {addingToCart ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" /> {t("cartBTN.adding")}
          </span>
        ) : (
          <span className="font-bold text-lg">
            {t("cartBTN.addToCartButton")}
          </span>
        )}
      </Button>
    </div>
  );
};

export default ProductAddToCart;
