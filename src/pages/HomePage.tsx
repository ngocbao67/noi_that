import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { CollectionBanners } from '../components/home/CollectionBanners';
import { NewArrivals } from '../components/home/NewArrivals';
import { WhyChooseUs } from '../components/home/WhyChooseUs';

export const HomePage: React.FC = () => {
  return (
    <main>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <CollectionBanners />
      <NewArrivals />
      <WhyChooseUs />
    </main>
  );
};
