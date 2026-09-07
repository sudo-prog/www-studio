import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2'
import Hero2 from '../../components/HeroPages/hero2/Hero2';
import About2 from '../../components/AboutPages/about2/about2';
import ShopbannerSection from '../../components/ShopbannerSection/ShopbannerSection';
import IconboxSection from '../../components/IconboxSection/IconboxSection';
import MarqueeSectionS2 from '../../components/MarqueePages/MarqueeSectionS2/MarqueeSectionS2';
import ServiceSectionS2 from '../../components/ServicePages/ServiceSectionS2/ServiceSectionS2';
import ProjectSectionS2 from '../../components/ProjectPages/ProjectSectionS2/ProjectSectionS2';
import ProductSectionS3 from '../../components/ProductPages/ProductSectionS3/ProductSectionS3';
import ProductSectionS2 from '../../components/ProductPages/ProductSectionS2/ProductSectionS2';
import MarqueeSectionS4 from '../../components/MarqueePages/MarqueeSectionS4/MarqueeSectionS4';
import QualityPrintingSection from '../../components/QualityPrintingSection/QualityPrintingSection';
import BrandSection from '../../components/BrandPages/BrandSection/BrandSection';
import TestimonialSectionS2 from '../../components/TestimonialPages/TestimonialSectionS2/TestimonialSectionS2';
import FaqSection from '../../components/FaqSection/FaqSection';
import MarqueeSectionS3 from '../../components/MarqueePages/MarqueeSectionS3/MarqueeSectionS3';
import BlogSection from '../../components/BlogPages/BlogSection/BlogSection';
import FooterS2 from '../../components/FooterPages/footerS2/FooterS2';

import { connect } from "react-redux";
import { addToCart } from "../../store/actions/action";
import api from "../../api";

const HomePage2 = ({ addToCart }) => {
    const productsArray = api();

    const addToCartProduct = (product, qty = 1) => {
        addToCart(product, qty);
    };

    const products = productsArray

    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <Hero2 />
            <IconboxSection />
            <ShopbannerSection />
            <About2 hclass={'about-section section-padding pt-0'} />
            <MarqueeSectionS2 />
            <ProductSectionS3 products={products} />
            <ServiceSectionS2 />
            <ProjectSectionS2 hclass={'project-section s2 fix section-padding pt-0'} />
            <ProductSectionS2
                addToCartProduct={addToCartProduct}
                products={products}
            />
            <MarqueeSectionS4 />
            <QualityPrintingSection />
            <BrandSection />
            <TestimonialSectionS2 />
            <FaqSection />
            <MarqueeSectionS3 />
            <BlogSection hclass="blog-section-2 section-padding bg-cover" SubClass="blog-wrapper mb-0" blogAllbtn={false} />
            <FooterS2 />

        </Fragment>
    )
};
// export default connect(null, { addToCart })(HomePage2);
export { HomePage2 as InkMeHomePage2 };
