import { Button } from "flowbite-react";

export default function LandingPage() {
  return (
    <section className="h-screen flex flex-col items-center justify-center bg-amber-50 text-center px-4">
      <h1 className="text-5xl font-extrabold text-amber-900 mb-6">
        Chào mừng đến với{" "}
        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          XYZ Restaurant
        </span>
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl mb-8">
        Không gian ấm cúng, sang trọng – nơi trải nghiệm ẩm thực tinh tế và đẳng
        cấp.
      </p>
      <Button
        size="lg"
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-stone-800 font-semibold shadow-md hover:opacity-90">
        Đặt bàn ngay
      </Button>
    </section>
  );
}
