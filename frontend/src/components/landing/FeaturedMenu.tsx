import { Carousel, Card, Button } from "flowbite-react";
import beefSteak from "../../assets/temp/beef_steak.jpg";
import pizzaSeafood from "../../assets/temp/pizza_seafood.jpg";
import sushiCombo from "../../assets/temp/sushi_combo.jpg";
import saladFruit from "../../assets/temp/salad_fruit.jpg";
import carbonaraPasta from "../../assets/temp/carbonara_pasta.jpg";

export default function FeaturedMenu() {
  const featuredDishes = [
    { name: "Steak Bò", img: beefSteak, price: "250.000đ" },
    { name: "Pizza Hải Sản", img: pizzaSeafood, price: "180.000đ" },
    { name: "Sushi Combo", img: sushiCombo, price: "220.000đ" },
    { name: "Salad Trái Cây", img: saladFruit, price: "120.000đ" },
    { name: "Mì Ý Carbonara", img: carbonaraPasta, price: "150.000đ" },
  ];

  return (
    <section id="menu" className="pt-5 h-screen bg-amber-50 text-center px-4">
      <h2 className="text-4xl font-bold text-amber-900">Món nổi bật</h2>
      <Carousel slideInterval={5000} className="max-w-8xl mx-auto h-[600px]">
        {featuredDishes.map((dish, idx) => (
          <Card
            key={idx}
            className="max-w-sm w-full mx-auto !bg-amber-100 border !border-amber-200 shadow-lg rounded-xl hover:scale-105 transition-transform duration-300">
            <img
              src={dish.img}
              alt={dish.name}
              className="rounded-t-xl object-cover h-64 w-full"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold !text-stone-800">
                {dish.name}
              </h3>
              <p className="!text-amber-700 font-bold mt-2">{dish.price}</p>
              <Button
                size="lg"
                className="mt-4 w-full font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-stone-800 shadow-md hover:opacity-90 transition">
                Đặt món
              </Button>
            </div>
          </Card>
        ))}
      </Carousel>
    </section>
  );
}
