import { Button, HRTrimmed } from "flowbite-react";
import FeaturedMenu from "../../../components/landing/FeaturedMenu";

export default function LandingPage() {
  return (
    <>
      <section className="h-screen flex flex-col items-center justify-center bg-amber-50 text-center px-4">
        <h1 className="text-5xl font-extrabold text-amber-900 mb-6">
          Chào mừng đến với{" "}
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            XYZ Restaurant
          </span>
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mb-8">
          Không gian ấm cúng, sang trọng – nơi trải nghiệm ẩm thực tinh tế và
          đẳng cấp.
        </p>
        <div className="flex gap-4">
          <Button
            size="lg"
            className="font-semibold bg-amber-900 text-amber-50 shadow-md hover:scale-105 transition-transform duration-200">
            Đặt bàn ngay
          </Button>
          <Button
            size="lg"
            className="font-semibold bg-amber-900 text-amber-50 shadow-md hover:scale-105 transition-transform duration-200">
            Đặt món ngay
          </Button>
        </div>
      </section>

      <HRTrimmed />

      {/* Featured Menu Section */}
      <FeaturedMenu />
    </>
  );
}
