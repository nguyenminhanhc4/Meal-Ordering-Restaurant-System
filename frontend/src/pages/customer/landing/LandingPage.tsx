export default function LandingPage() {
  return (
    <section className="h-screen flex flex-col items-center justify-center bg-amber-50 text-center">
      <h1 className="text-5xl font-bold text-amber-900 mb-6">
        Chào mừng đến với XYZ Restaurant
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl mb-8">
        Không gian ấm cúng, sang trọng – nơi trải nghiệm ẩm thực tinh tế và đẳng
        cấp.
      </p>
      <button className="px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-700">
        Đặt bàn ngay
      </button>
    </section>
  );
}
