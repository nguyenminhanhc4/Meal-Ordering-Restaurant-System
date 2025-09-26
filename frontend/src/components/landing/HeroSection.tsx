import { Button } from "flowbite-react";
import bgRestaurant from "../../assets/img/bg_restaurant.png";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgRestaurant})` }}>
      {/* Overlay tối + blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Nội dung */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-5xl font-extrabold text-white mb-6">
          Chào mừng đến với{" "}
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            XYZ Restaurant
          </span>
        </h1>
        <h2 className="text-lg text-gray-200 max-w-2xl mb-8">
          Không gian ấm cúng, sang trọng – nơi trải nghiệm ẩm thực tinh tế và
          đẳng cấp.
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            href="#"
            className="font-semibold bg-amber-900 text-amber-50 shadow-md hover:scale-105 transition-transform duration-200">
            Đặt bàn ngay
          </Button>
          <Button
            size="lg"
            href="/menu "
            className="font-semibold bg-amber-900 text-amber-50 shadow-md hover:scale-105 transition-transform duration-200">
            Đặt món ngay
          </Button>
        </div>
      </div>
    </section>
  );
}
