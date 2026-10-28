import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { CartDrawer } from '../common/CartDrawer';

export const StoreLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-[#242424]">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <CartDrawer />
      <Footer />
    </div>
  );
};
