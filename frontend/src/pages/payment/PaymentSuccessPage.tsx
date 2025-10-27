import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiCheckCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
      <HiCheckCircle className="text-green-600 w-24 h-24 mb-6" />
      <h1 className="text-3xl font-bold text-green-800 mb-4">
        {t("payment.success.title")}
      </h1>
      <p className="text-gray-700 mb-6 text-center max-w-md">
        {t("payment.success.description")}
      </p>
      <Button color="green" size="lg" onClick={() => navigate("/order")}>
        {t("payment.backToOrders")}
      </Button>
    </section>
  );
};

export default PaymentSuccessPage;
