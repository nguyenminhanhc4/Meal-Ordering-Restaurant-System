import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import { createPayment } from "../../services/payment/paymentService";
import { initiatePayment } from "../../services/payment/mockPaymentService";
import { getOrderById } from "../../services/order/checkoutService";
import type { PaymentRequestDto } from "../../services/types/PaymentType";
import type { OrderDto } from "../../services/types/OrderType";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useNotification } from "../../components/Notification/NotificationContext";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

// Định nghĩa lại một chút interface cho rõ ràng
interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  note?: string;
}

// Custom Input Component để tái sử dụng và tạo style đẹp hơn
const CustomInput = ({
  label,
  error,
  ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
>) => (
  <div className="relative">
    <input
      {...props}
      id={props.name}
      className={`peer w-full border rounded-lg pt-4 pb-2 px-3 focus:outline-none focus:ring-2 transition duration-150 placeholder-transparent 
        ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-orange-500"
        }`}
      placeholder={label}
    />
    <label
      htmlFor={props.name}
      className="absolute left-3 top-1 text-xs text-gray-500 transition-all duration-150 ease-in-out
        peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
        peer-focus:top-1 peer-focus:text-xs peer-focus:text-orange-600">
      {label}
    </label>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Custom Textarea Component
const CustomTextarea = ({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="relative">
    <textarea
      {...props}
      id={props.name}
      rows={3}
      className={`peer w-full border rounded-lg pt-4 pb-2 px-3 focus:outline-none focus:ring-2 transition duration-150 placeholder-transparent resize-none
        ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-orange-500"
        }`}
      placeholder={label}
    />
    <label
      htmlFor={props.name}
      className="absolute left-3 top-1 text-xs text-gray-500 transition-all duration-150 ease-in-out
        peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
        peer-focus:top-1 peer-focus:text-xs peer-focus:text-orange-600">
      {label}
    </label>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function PaymentPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>(); // Đảm bảo type cho useParams

  const [order, setOrder] = useState<OrderDto | null>(
    (location.state as { order: OrderDto })?.order || null
  );
  const [loading, setLoading] = useState(!order);
  const [method, setMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    note: "",
  });

  // Fallback: fetch order nếu user vào trực tiếp URL
  useEffect(() => {
    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          const data = await getOrderById(orderId);
          setOrder(data);
        } catch (err) {
          console.error("Failed to fetch order for payment", err);
          // Có thể navigate về trang lỗi hoặc thông báo cụ thể
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [order, orderId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    if (!order || submitting) return;

    const newErrors: Record<string, string> = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = t("payment.errors.requiredFullName");
    }

    if (!shippingInfo.email.trim()) {
      newErrors.email = t("payment.errors.requiredEmail");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = t("payment.errors.invalidEmail");
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = t("payment.errors.requiredPhone");
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(shippingInfo.phone)) {
      newErrors.phone = t("payment.errors.invalidPhone");
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = t("payment.errors.requiredAddress");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      notify("error", t("payment.notify.missingFields"));
      return;
    }

    try {
      setSubmitting(true);

      const paymentDataToSend: PaymentRequestDto = {
        orderId: order.id,
        paymentMethodCode: method,
        ...shippingInfo,
      };

      if (method === "COD") {
        // COD: tạo payment bình thường
        const payment = await createPayment(paymentDataToSend);
        notify("success", t("payment.notify.success"));
        console.log("Created payment:", payment);
        navigate(`/orders/${order.publicId}`, { state: { order } });
      } else if (method === "ONLINE") {
        // ONLINE: gọi initiatePayment -> trả về redirectUrl
        const payment = await initiatePayment(paymentDataToSend); // gọi /mock-payments/initiate
        console.log("Initiated payment:", payment.redirectUrl);

        sessionStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));
        window.location.href = `http://localhost:5173${payment.redirectUrl}`;
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error(
          "Backend returned error:",
          err.response?.status,
          err.response?.data
        );
        notify("error", t("payment.notify.failed"));
        console.error("Payment failed", err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // UI Loading
  if (loading) {
    return (
      <section className="flex justify-center items-center min-h-[50vh] bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-2"></div>
          <p className="text-lg text-gray-600">
            {t("payment.loading.message")}
          </p>
        </div>
      </section>
    );
  }

  // UI Order Not Found
  if (!order) {
    return (
      <section className="text-center p-8 bg-white shadow-lg m-8 rounded-xl">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          {t("payment.error.title")}
        </h1>
        <p className="text-gray-700">{t("payment.error.notFound")}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition duration-200">
          {t("payment.error.backHome")}
        </button>
      </section>
    );
  }

  // Main UI
  return (
    <section className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl py-12 px-4 md:px-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8 text-center">
          {t("payment.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột 1 & 2: Thông tin giao hàng và Phương thức */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 transition hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-orange-600 mb-6 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243m10.606-10.606L13.414 3.1a1.998 1.998 0 00-2.828 0l-4.243 4.243m10.606 10.606l-4.243 4.243a1.998 1.998 0 01-2.828 0l-4.243-4.243M6.757 7.343l-4.243 4.243a1.998 1.998 0 000 2.828l4.243 4.243M17.243 7.343l4.243 4.243a1.998 1.998 0 010 2.828l-4.243 4.243M12 21h0"></path>
                </svg>
                {t("payment.shipping.title")}
              </h2>
              <p className="mb-4 text-gray-600">{t("payment.shipping.desc")}</p>
              <div className="space-y-4">
                <CustomInput
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleChange}
                  label={t("payment.shipping.fields.fullName")}
                  error={errors.fullName}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInput
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleChange}
                    label={t("payment.shipping.fields.email")}
                    error={errors.email}
                  />
                  <CustomInput
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleChange}
                    label={t("payment.shipping.fields.phone")}
                    error={errors.phone}
                  />
                </div>
                <CustomInput
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleChange}
                  label={t("payment.shipping.fields.address")}
                  error={errors.address}
                />
                <CustomTextarea
                  name="note"
                  value={shippingInfo.note}
                  onChange={handleChange}
                  label={t("payment.shipping.fields.note")}
                  error={errors.note}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 transition hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-orange-600 mb-6 flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                {t("payment.method.title")}
              </h2>
              <div className="space-y-4">
                {/* COD */}
                <label
                  className={`block p-4 border rounded-xl cursor-pointer transition duration-300 ${
                    method === "COD"
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={method === "COD"}
                      onChange={() => setMethod("COD")}
                      className="form-radio h-5 w-5 text-green-600"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-lg text-gray-800">
                        {t("payment.method.cod.label")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("payment.method.cod.desc")}
                      </p>
                    </div>
                  </div>
                </label>

                {/* ONLINE */}
                <label
                  className={`block p-4 border rounded-xl cursor-pointer transition duration-300 ${
                    method === "ONLINE"
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={method === "ONLINE"}
                      onChange={() => setMethod("ONLINE")}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-lg text-gray-800">
                        {t("payment.method.online.label")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("payment.method.online.desc")}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Cột 3: Tóm tắt đơn hàng và Tổng cộng */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="sticky top-10 bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                {t("payment.summary.title", { id: order.publicId.slice(0, 8) })}
              </h2>

              {/* Order Items List (Simplified) */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {order.orderItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm border-b py-2 last:border-b-0">
                    <p className="text-gray-700">
                      {item.comboName || item.menuItemName}{" "}
                      <span className="text-xs text-gray-500">
                        {t("payment.summary.items.x", { count: item.quantity })}
                      </span>
                    </p>
                    <p className="font-semibold text-gray-800">
                      {(item.price * item.quantity).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xl font-bold text-gray-800">
                    {t("payment.summary.totalLabel")}
                  </p>
                  <p className="text-2xl font-extrabold text-green-600">
                    {order.totalAmount?.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>
                </div>

                {/* Confirm Payment Button */}
                <button
                  disabled={submitting}
                  onClick={handlePayment}
                  className={`w-full py-3 mt-2 rounded-xl text-white font-bold text-lg transition duration-300 transform hover:scale-[1.01]
                            ${
                              submitting
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200/50"
                            }`}>
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("payment.summary.button.processing")}
                    </span>
                  ) : (
                    t("payment.summary.button.pay")
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-gray-500">
                  {t("payment.summary.terms")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
