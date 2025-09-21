import { Outlet } from "react-router-dom";
import bgRestaurant from "../../assets/img/bg_restaurant.png";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side (Image) */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src={bgRestaurant}
          alt="Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl font-bold">Welcome to XYZ Restaurant</h1>
          <p className="mt-4 text-lg">Taste the difference</p>
        </div>
      </div>

      <div
        className="flex w-full md:w-1/2 items-center justify-center
         bg-stone-800 p-6">
        <div className="w-full h-full flex flex-col justify-center px-8 text-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
