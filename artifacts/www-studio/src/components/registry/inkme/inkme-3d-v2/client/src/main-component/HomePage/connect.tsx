import * as React from 'react';
import Navbar from '../../components/NavbarPages/Navbar/Navbar'
import Hero from '../../components/HeroPages/hero/hero';
import FeatureSection from '../../components/FeaturePages/FeatureSection/FeatureSection';
import About from '../../components/AboutPages/about/about';
import MarqueeSection from '../../components/MarqueePages/MarqueeSection/MarqueeSection';
import ServiceSection from '../../components/ServicePages/ServiceSection/ServiceSection';
import StoreSection from '../../components/StoreSection/StoreSection';
import ProductSection from '../../components/ProductPages/ProductSection/ProductSection';
import PortfolioSection from '../../components/PortfolioSection/PortfolioSection';
import FunFact from '../../components/FunFact/FunFact';
import WorksSection from '../../components/WorksSection/WorksSection';
import ProcessSection from '../../components/ProcessPages/ProcessSection/ProcessSection';
import PricingSection from '../../components/PricingSection/PricingSection';
import Testimonial from '../../components/TestimonialPages/Testimonial/Testimonial';
import BlogSection from '../../components/BlogPages/BlogSection/BlogSection';
import CtaSection from '../../components/CtaPages/CtaSection/CtaSection';
import Footer from '../../components/FooterPages/footer/Footer';
import SocialMetaTags from '../../components/SocialMetaTags/SocialMetaTags';

import ServiceBg from '../../img/service/service-bg.jpg'
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/action";
import api from "../../api";
import Ws6 from '../../img/feature/bg.png'

const HomePage = ({ addToCart }) => {

    const productsArray = api();

    const addToCartProduct = (product, qty = 1) => {
        addToCart(product, qty);
    };

    const products = productsArray

    return (
        <Fragment>
            <SocialMetaTags
                title="InkMe - Professional printing services"
                description="InkMe - Professional printing services, online 3D customization. Custom T-shirt, hoodie, and bag printing with high quality and affordable prices."
                image="/inkme_thumbnail.png"
                url="/"
            />
            <Navbar hclass={'header-section'} />
            <Hero />
            {/* <FeatureSection /> */}
            <About />
            {/* <MarqueeSection hclass={'marquee-section margin-top-8 mb-80'} /> */}
            <ServiceSection hclass={'service-section section-padding bg-cover '} Bg={ServiceBg} />
            <ProductSection
                addToCartProduct={addToCartProduct}
                products={products}
            />
            <StoreSection />

            <PortfolioSection />
            {/* <FunFact hclass={'counter-section fix section-padding pt-0'} /> */}
            <WorksSection hclass={'about-feature-section fix section-padding pt-0 bg-cover'} eclass={'about-feature-wrapper'} Ws6={Ws6} />
            <ProcessSection />
            {/* <PricingSection /> */}
            {/* <Testimonial /> */}
            {/* <BlogSection hclass="blog-section section-padding pt-0 bg-cover" SubClass="blog-wrapper" /> */}
            <CtaSection />
            <Footer />

        </Fragment>
    )
};
// export default connect(null, { addToCart })(HomePage);
export { HomePage as InkMeHomePage };
