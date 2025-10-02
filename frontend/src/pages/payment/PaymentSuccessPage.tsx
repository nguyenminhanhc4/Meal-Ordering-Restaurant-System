// src/pages/payment/PaymentSuccessPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiCheckCircle } from "react-icons/hi";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
      <HiCheckCircle className="text-green-600 w-24 h-24 mb-6" />
      <h1 className="text-3xl font-bold text-green-800 mb-4">
        Thanh toán thành công!
      </h1>
      <p className="text-gray-700 mb-6 text-center max-w-md">
        Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý và sẽ được
        giao sớm nhất.
      </p>
      <Button color="green" size="lg" onClick={() => navigate("/order")}>
        Quay lại danh sách đơn hàng
      </Button>
    </section>
  );
};

export default PaymentSuccessPage;
