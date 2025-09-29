import React, { useEffect, useState } from "react";
import { getCurrentCart } from "../../../services/cart/cartService";
import { useNotification } from "../../../components/Notification/NotificationContext";

interface CartItem {
  id: number;
  menuItemId: number;
  name: string;
  avatarUrl?: string;
  price: number;
  quantity: number;
  status: "AVAILABLE" | "OUT_OF_STOCK" | "COMING_SOON";
}

interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

const CartPage: React.FC = () => {
  const { notify } = useNotification();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCurrentCart();
        setCart(response.data);
      } catch (error) {
        notify("error", "Không thể tải giỏ hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [notify]);

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    if (!cart) return;
    try {
      const updatedCart = await updateCartItem(cart.id, itemId, newQty);
      setCart(updatedCart.data);
    } catch (error) {
      notify("error", "Không thể cập nhật số lượng");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!cart) return;
    try {
      const updatedCart = await removeCartItem(cart.id, itemId);
      setCart(updatedCart.data);
      notify("success", "Đã xóa món khỏi giỏ hàng");
    } catch (error) {
      notify("error", "Không thể xóa món");
    }
  };

  if (loading) return <div>Đang tải giỏ hàng...</div>;

  if (!cart || cart.items.length === 0)
    return (
      <div>
        Giỏ hàng trống. Quay lại <a href="/menu">Menu</a>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
            <div className="flex items-center gap-4">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-gray-600">
                  {item.price.toLocaleString("vi-VN")} VNĐ
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleQuantityChange(item.id, Math.max(1, item.quantity - 1))
                }>
                -
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    item.id,
                    Math.max(1, Number(e.target.value))
                  )
                }
                className="w-12 text-center border rounded"
              />
              <button
                onClick={() =>
                  handleQuantityChange(item.id, item.quantity + 1)
                }>
                +
              </button>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end text-xl font-bold">
        Tổng tiền:{" "}
        {cart.items
          .reduce((sum, i) => sum + i.price * i.quantity, 0)
          .toLocaleString("vi-VN")}{" "}
        VNĐ
      </div>
      <div className="mt-4 flex justify-end">
        <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default CartPage;
