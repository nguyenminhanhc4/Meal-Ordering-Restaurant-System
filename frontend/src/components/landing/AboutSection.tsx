import { Card, Button } from "flowbite-react";
import { HiHome, HiOutlineUserGroup, HiCake } from "react-icons/hi";
import bg_scene from "../../assets/img/bg_restaurant.png";
import bg_food from "../../assets/temp/beef_steak.jpg";
import bg_staff from "../../assets/temp/staff_photo.jpg";

export default function AboutSection() {
  const features = [
    {
      title: "Không gian sang trọng",
      description:
        "Thiết kế hiện đại, ánh sáng ấm cúng, tạo cảm giác thoải mái cho thực khách.",
      icon: <HiHome className="w-8 h-8 text-white" />,
      imageUrl: bg_scene,
    },
    {
      title: "Đồ ăn tươi ngon",
      description:
        "Nguyên liệu chất lượng cao, chế biến tinh tế, đảm bảo hương vị tuyệt vời.",
      icon: <HiCake className="w-8 h-8 text-white" />,
      imageUrl: bg_food,
    },
    {
      title: "Dịch vụ chuyên nghiệp",
      description:
        "Đội ngũ nhân viên thân thiện, tận tâm, mang đến trải nghiệm tuyệt vời.",
      icon: <HiOutlineUserGroup className="w-8 h-8 text-white" />,
      imageUrl: bg_staff,
    },
  ];

  return (
    <section id="about" className="py-16 px-4 bg-amber-50 text-center">
      <h2 className="text-4xl font-bold text-amber-900 mb-4">Về chúng tôi</h2>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-10">
        XYZ Restaurant cam kết mang đến trải nghiệm ẩm thực tinh tế, với không
        gian sang trọng và dịch vụ tận tâm.
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        {features.map((feature, idx) => (
          <Card
            key={idx}
            className="flex flex-col items-center text-center !border-amber-200 !bg-gradient-to-b from-amber-50 to-amber-100 shadow-lg rounded-xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="relative rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              {/* Phần ảnh trên */}
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${feature.imageUrl})` }}></div>

              {/* Icon nổi lên */}
              <div className="absolute top-20 left-10 transform -translate-x-1/2 w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full shadow-lg">
                {feature.icon}
              </div>

              {/* Phần text dưới */}
              <div className="bg-amber-50 p-6 pt-10 text-center">
                <h3 className="text-xl font-semibold text-stone-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          href="#"
          className="font-semibold bg-amber-900 text-amber-50 shadow-md hover:scale-105 transition-transform duration-200">
          Đặt bàn ngay
        </Button>
        <Button
          size="lg"
          href="/menu"
          className="font-semibold bg-amber-900 text-amber-50 shadow-md hover:scale-105 transition-transform duration-200">
          Đặt món ngay
        </Button>
      </div>
    </section>
  );
}
