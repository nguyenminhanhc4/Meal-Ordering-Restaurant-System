import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiXCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";

const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <HiXCircle className="text-red-600 w-24 h-24 mb-6" />
      <h1 className="text-3xl font-bold text-red-800 mb-4">
        {t("payment.failed.title")}
      </h1>
      <p className="text-gray-700 mb-6 text-center max-w-md">
        {t("payment.failed.description")}
      </p>
      <div className="flex gap-4">
        <Button color="red" size="lg" onClick={() => navigate(-1)}>
          {t("payment.failed.retry")}
        </Button>
        <Button color="gray" size="lg" onClick={() => navigate("/order")}>
          {t("payment.backToOrders")}
        </Button>
      </div>
    </section>
  );
};

export default PaymentFailedPage;
