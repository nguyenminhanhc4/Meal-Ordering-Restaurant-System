// src/pages/MockPaymentPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMockPayment,
  approveMockPayment,
  cancelMockPayment,
} from "../../services/payment/mockPaymentService";
import type { PaymentDto } from "../../services/types/PaymentType";
import { useNotification } from "../../components/Notification/NotificationContext";

export default function MockPaymentPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const { notify } = useNotification();
  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (publicId) {
      getMockPayment(publicId)
        .then((data) => setPayment(data))
        .catch((err) => alert("Payment not found" + err))
        .finally(() => setLoading(false));
    }
  }, [publicId]);

  const handleApprove = async () => {
    if (!publicId) return;
    setSubmitting(true);
    try {
      const result = await approveMockPayment(publicId);
      notify("success", "Payment Approved!");
      window.location.href = `${result.redirectUrl}`;
    } catch (err) {
      notify("error", "Failed to approve payment" + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!publicId) return;
    setSubmitting(true);
    try {
      const result = await cancelMockPayment(publicId);
      notify("success", "Payment Cancelled");
      window.location.href = `${result.redirectUrl}`;
    } catch (err) {
      notify("error", "Failed to cancel payment" + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading payment...</p>;
  if (!payment) return <p>Payment not found</p>;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Mock Payment Gateway</h1>
      <p className="mb-2">Order ID: {payment.orderId}</p>
      <p className="mb-4">Amount: {payment.amount.toLocaleString()} VND</p>
      <div className="flex gap-4">
        <button
          onClick={handleApprove}
          disabled={submitting}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
          Approve
        </button>
        <button
          onClick={handleCancel}
          disabled={submitting}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}
