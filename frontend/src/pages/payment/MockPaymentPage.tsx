import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMockPayment,
  approveMockPayment,
  cancelMockPayment,
} from "../../services/payment/mockPaymentService";
import type { PaymentDto } from "../../services/types/PaymentType";
import { useNotification } from "../../components/Notification/NotificationContext";
import { useTranslation } from "react-i18next";

export default function MockPaymentPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const { notify } = useNotification();
  const { t } = useTranslation();
  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (publicId) {
      getMockPayment(publicId)
        .then((data) => setPayment(data))
        .catch((err) => alert(t("payment.notFound") + err))
        .finally(() => setLoading(false));
    }
  }, [publicId, t]);

  const handleApprove = async () => {
    if (!publicId) return;
    setSubmitting(true);
    try {
      const savedShipping = sessionStorage.getItem("shippingInfo");
      const shippingInfo = savedShipping ? JSON.parse(savedShipping) : null;

      if (!shippingInfo) {
        notify("error", t("payment.missingShipping"));
        return;
      }

      const result = await approveMockPayment(publicId, shippingInfo);
      notify("success", t("payment.approved"));
      window.location.href = `${result.redirectUrl}`;
    } catch (err) {
      notify("error", t("payment.approveFailed") + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!publicId) return;
    setSubmitting(true);
    try {
      const result = await cancelMockPayment(publicId);
      notify("success", t("payment.cancelled"));
      window.location.href = `${result.redirectUrl}`;
    } catch (err) {
      notify("error", t("payment.cancelFailed") + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>{t("payment.loading")}</p>;
  if (!payment) return <p>{t("payment.notFound")}</p>;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-4">{t("payment.mockTitle")}</h1>
      <p className="mb-2">
        {t("payment.orderId")}: {payment.orderId}
      </p>
      <p className="mb-4">
        {t("payment.amount")}: {payment.amount.toLocaleString()} VND
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleApprove}
          disabled={submitting}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
          {t("payment.approveBtn")}
        </button>
        <button
          onClick={handleCancel}
          disabled={submitting}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg">
          {t("payment.cancelBtn")}
        </button>
      </div>
    </div>
  );
}
