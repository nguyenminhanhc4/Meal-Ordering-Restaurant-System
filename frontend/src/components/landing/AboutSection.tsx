import { Card, Button } from "flowbite-react";
import { HiHome, HiOutlineUserGroup, HiCake } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import bg_scene from "../../assets/img/bg_restaurant.png";
import bg_food from "../../assets/temp/beef_steak.jpg";
import bg_staff from "../../assets/temp/staff_photo.jpg";

export default function AboutSection() {
  const { t } = useTranslation();

  const features = [
    {
      title: t("home.about.features.luxurySpace.title"),
      description: t("home.about.features.luxurySpace.description"),
      icon: <HiHome className="w-8 h-8 text-white" />,
      imageUrl: bg_scene,
    },
    {
      title: t("home.about.features.freshFood.title"),
      description: t("home.about.features.freshFood.description"),
      icon: <HiCake className="w-8 h-8 text-white" />,
      imageUrl: bg_food,
    },
    {
      title: t("home.about.features.professionalService.title"),
      description: t("home.about.features.professionalService.description"),
      icon: <HiOutlineUserGroup className="w-8 h-8 text-white" />,
      imageUrl: bg_staff,
    },
  ];

  return (
    <section id="about" className="py-16 px-4 bg-amber-50 text-center">
      <h2 className="text-4xl font-bold text-amber-900 mb-4">
        {t("home.about.title")}
      </h2>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-10">
        {t("home.about.description")}
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        {features.map((feature, idx) => (
          <Card
            key={idx}
            className="flex flex-col items-center text-center !border-amber-200 !bg-gradient-to-b from-amber-50 to-amber-100 shadow-lg rounded-xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="relative rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${feature.imageUrl})` }}></div>

              <div className="absolute top-20 left-10 transform -translate-x-1/2 w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full shadow-lg">
                {feature.icon}
              </div>

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
          href="/table"
          className="font-semibold bg-amber-900 text-amber-50 shadow-md hover:scale-105 transition-transform duration-200">
          {t("home.about.bookTable")}
        </Button>
        <Button
          size="lg"
          href="/menu"
          className="font-semibold bg-amber-900 text-amber-50 shadow-md hover:scale-105 transition-transform duration-200">
          {t("home.about.orderNow")}
        </Button>
      </div>
    </section>
  );
}
