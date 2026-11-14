import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import MobileBottomBar from '../common/MobileBottomBar';

const StorefrontLayout = () => {
  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 pb-5 mb-5 pb-md-0 mb-md-0">
          <Outlet />
        </main>
        <Footer />
      </div>
      <MobileBottomBar />
    </>
  );
};

export default StorefrontLayout;
