import { HRTrimmed } from "flowbite-react";
import FeaturedMenu from "../../../components/landing/FeaturedMenu";
import AboutSection from "../../../components/landing/AboutSection";
import HeroSection from "../../../components/landing/HeroSection";
// import BookingForm from "../../../components/landing/BookingForm";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      <HRTrimmed className="!bg-amber-900" />

      {/* Featured Menu Section */}
      <FeaturedMenu />

      <HRTrimmed className="!bg-amber-900" />

      {/* About Section */}
      <AboutSection />

      {/* <HRTrimmed className="!bg-amber-900" /> */}

      {/* Booking Form Section */}
      {/* <BookingForm /> */}
    </>
  );
}
