import HeroSection from "@/components/home/HeroSection";
import FeaturedListings from "@/components/home/FeaturedListings";
import HowItWorks from "@/components/home/HowItWorks";
import ServiceTypes from "@/components/home/ServiceTypes";
import ListYourVanCta from "@/components/home/ListYourVanCta";
import Testimonials from "@/components/home/Testimonials";
import FaqSection from "@/components/home/FaqSection";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Man and Van - Find Reliable Moving Services in the UK</title>
        <meta 
          name="description" 
          content="Connect with trusted local drivers for moving, delivery, and transport services at competitive rates across the UK."
        />
      </Helmet>
      
      <HeroSection />
      <FeaturedListings />
      <HowItWorks />
      <ServiceTypes />
      <ListYourVanCta />
      <Testimonials />
      <FaqSection />
    </>
  );
};

export default Home;
