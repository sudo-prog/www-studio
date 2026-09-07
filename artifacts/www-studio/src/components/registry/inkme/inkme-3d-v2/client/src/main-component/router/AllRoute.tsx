import React from 'react';
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import Homepage from '../HomePage/HomePage'
import HomePage2 from '../HomePage2/HomePage2';
import HomePage3 from '../HomePage3/HomePage3';
import AboutPage from '../AboutPage/AboutPage';
import ServicePage from '../ServicePage/ServicePage';
import ServiceSinglePage from '../ServiceSinglePage/ServiceSinglePage';
import ProjectPage from '../ProjectPage/ProjectPage';
import ProjectSinglePage from '../ProjectSinglePage/ProjectSinglePage';
import ShopPage from '../ShopPage'
import ShopSinglePage from '../ShopSinglePage';
import CartPage from '../CartPage';
import CheckoutPage from '../CheckoutPage';
import OrderRecived from '../OrderRecived';
import BlogPage from '../BlogPage/BlogPage'
import BlogDetails from '../BlogDetails/BlogDetails'
import ContactPage from '../ContactPage/ContactPage';
import ErrorPage from '../ErrorPage/ErrorPage';
import Signup from "../User/signup";
import LoginScreen from "../User/login";
import ForgotPassword from "../User/forgot-password";
import ResetPassword from "../User/reset-password";
import Profile from '../User/Profile';
import OrdersPage from '../OrdersPage/OrdersPage';

const AllRoute = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Homepage />} />
          <Route path="home" element={<Homepage />} />
          <Route path="home-2" element={<HomePage2 />} />
          <Route path="home-3" element={<HomePage3 />} />
          <Route path="about" element={<AboutPage />} />
          {/* Shop */}
          {/* <Route path="service" element={<ServiceSinglePage />} /> */}
          <Route path="service-details/:slug" element={<ServiceSinglePage />} />
          <Route path="project" element={<ProjectPage />} />
          <Route path="project-details/:slug" element={<ProjectSinglePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop-details/:slug" element={<ShopSinglePage />} />
          <Route path="shop-cart/:userId" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order_received" element={<OrderRecived />} />
          <Route path="news" element={<BlogPage />} />
          <Route path="blog-single/:slug" element={<BlogDetails />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="404" element={<ErrorPage />} />
          {/* User */}
          <Route path="login" element={<LoginScreen />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="login" element={<LoginScreen />} />
          <Route path="user/profile/:userId" element={<Profile />} />
          <Route path="user/orders/:userId" element={<OrdersPage />} />

          <Route path="shop-details/Calendar-printing-design/:slug" element={<ShopSinglePage />} />
        </Routes>

      </BrowserRouter>
    </div>
  );
};

// export default AllRoute;
export { AllRoute as InkMeAllRoute };
