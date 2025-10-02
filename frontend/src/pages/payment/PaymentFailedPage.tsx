// src/pages/payment/PaymentFailedPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiXCircle } from "react-icons/hi";

const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <HiXCircle className="text-red-600 w-24 h-24 mb-6" />
      <h1 className="text-3xl font-bold text-red-800 mb-4">
        Thanh toán thất bại
      </h1>
      <p className="text-gray-700 mb-6 text-center max-w-md">
        Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn
        phương thức khác.
      </p>
      <div className="flex gap-4">
        <Button color="red" size="lg" onClick={() => navigate(-1)}>
          Quay lại thanh toán
        </Button>
        <Button color="gray" size="lg" onClick={() => navigate("/order")}>
          Quay lại danh sách đơn hàng
        </Button>
      </div>
    </section>
  );
};

export default PaymentFailedPage;
