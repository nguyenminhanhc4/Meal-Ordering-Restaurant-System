import React, { useState } from "react";
import { Button, Badge } from "flowbite-react";
import { HiEye, HiShoppingCart } from "react-icons/hi";
import { getComboById } from "../../services/product/fetchCombo";
import { useNotification } from "../Notification/NotificationContext";
import { useCart } from "../../store/CartContext";
import {
  getCurrentCart,
  createCart,
  addItemToCart,
} from "../../services/cart/cartService";
import { useRealtimeUpdate } from "../../api/useRealtimeUpdate";
import { useTranslation } from "react-i18next";
import type { Combo } from "../../services/product/fetchCombo";

interface ComboCardProps {
  combo: Combo;
}

const ComboCard: React.FC<ComboCardProps> = ({ combo }) => {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { fetchCart } = useCart();
  const [currentCombo, setCurrentCombo] = useState(combo);

  // 🔄 Realtime update combo info
  useRealtimeUpdate(
    `/topic/combo/${combo?.id}`,
    getComboById,
    (updated) => {
      if (updated) {
        setCurrentCombo(updated);
        notify("info", t("comboCard.updated", { name: updated.name }));
      }
    },
    (msg: { comboId: number }) => msg.comboId
  );

  const handleAddToCart = async () => {
    if (currentCombo.status !== "AVAILABLE") {
      notify("error", t("comboCard.notAvailable", { name: currentCombo.name }));
      return;
    }

    try {
      const cart = await getCurrentCart().catch(() => createCart());
      await addItemToCart(cart.id, {
        menuItemId: currentCombo.id,
        quantity: 1,
      });
      notify(
        "success",
        t("comboCard.addedToCart", { name: currentCombo.name })
      );
      await fetchCart();
    } catch (error) {
      console.error(error);
      notify("error", t("comboCard.addToCartError"));
    }
  };

  type ComboStatus = "AVAILABLE" | "OUT_OF_STOCK" | "COMING_SOON" | string;

  const statusColors: Record<ComboStatus, string> = {
    AVAILABLE: "bg-green-500",
    OUT_OF_STOCK: "bg-red-500",
    COMING_SOON: "bg-blue-500",
  };

  return (
    <div
      className={`p-4 bg-white rounded-lg shadow-md hover:shadow-xl border border-stone-200 hover:border-yellow-400 transition-all duration-300 ${
        currentCombo.status !== "AVAILABLE" ? "opacity-70" : ""
      }`}>
      <div className="relative">
        {currentCombo.avatarUrl ? (
          <img
            src={`${currentCombo.avatarUrl}?w=400&h=300&c=fill`}
            alt={currentCombo.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
            {t("comboCard.noImage")}
          </div>
        )}

        <span
          className={`absolute top-2 left-2 ${
            statusColors[currentCombo.status]
          } text-white text-sm px-2 py-1 rounded`}>
          {t(`comboCard.status.${currentCombo.status.toLowerCase()}`)}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-1">
        {currentCombo.name}
      </h3>

      <p className="text-gray-600 text-base mb-2 line-clamp-2">
        {currentCombo.description}
      </p>

      {/* 🔸 Combo items */}
      <ul className="text-sm text-gray-500 mb-3 list-disc list-inside">
        {currentCombo.items.slice(0, 3).map((item) => (
          <li key={item.id}>
            {item.name} × {item.quantity}
          </li>
        ))}
        {currentCombo.items.length > 3 && (
          <li>
            +{currentCombo.items.length - 3} {t("comboCard.moreItems")}
          </li>
        )}
      </ul>

      <Badge color="warning" size="sm" className="mb-2">
        {currentCombo.category}
      </Badge>

      <p className="text-yellow-600 font-medium mb-3">
        {currentCombo.price.toLocaleString("vi-VN")} {t("productCard.currency")}
      </p>

      <div className="flex justify-between gap-2">
        <Button
          color="warning"
          size="lg"
          href={`/combo/product/${combo.id}`}
          className="hover:bg-yellow-500 flex-1">
          <HiEye className="mr-2 h-5 w-5" />
          {t("comboCard.view")}
        </Button>

        <Button
          color="success"
          size="lg"
          onClick={handleAddToCart}
          disabled={currentCombo.status !== "AVAILABLE"}
          className={`text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex-1 ${
            currentCombo.status !== "AVAILABLE"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}>
          <HiShoppingCart className="mr-2 h-5 w-5" />
          {t("comboCard.add")}
        </Button>
      </div>
    </div>
  );
};

export default ComboCard;
