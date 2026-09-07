import * as React from 'react';
import NavbarS3 from '../../components/NavbarPages/NavbarS3/NavbarS3'
import Hero3 from '../../components/HeroPages/hero3/hero3';
import BrandSectionS2 from '../../components/BrandPages/BrandSectionS2/BrandSectionS2';
import ProductSectionS5 from '../../components/ProductPages/ProductSectionS5/ProductSectionS5';
import About3 from '../../components/AboutPages/about3/about3';
import MarqueeSectionS4 from '../../components/MarqueePages/MarqueeSectionS4/MarqueeSectionS4';
import ServiceSectionS3 from '../../components/ServicePages/ServiceSectionS3/ServiceSectionS3';
import ShopBannerSectionS2 from '../../components/ShopBannerSectionS2/ShopBannerSectionS2';
import ProcessSectionS2 from '../../components/ProcessPages/ProcessSectionS2/ProcessSectionS2';
import ProjectSectionS3 from '../../components/ProjectPages/ProjectSectionS3/ProjectSectionS3';
import ProductSectionS4 from '../../components/ProductPages/ProductSectionS4/ProductSectionS4';
import FeatureSectionS2 from '../../components/FeaturePages/FeatureSectionS2/FeatureSectionS2';
import TestimonialSectionS3 from '../../components/TestimonialPages/TestimonialSectionS3/TestimonialSectionS3';
import BlogSectionS3 from '../../components/BlogPages/BlogSectionS3/BlogSectionS3';
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/action";
import api from "../../api";
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';


const HomePage3 = ({ addToCart }) => {
    const productsArray = api();
    const products = productsArray


    const addToCartProduct = (product, qty = 1) => {
        addToCart(product, qty);
    };

    return (
        <Fragment>
            <NavbarS3 hclass={'header-section'} />
            <Hero3 />
            <BrandSectionS2 />
            <ProductSectionS5 products={products} />
            <About3 />
            <MarqueeSectionS4 />
            <ServiceSectionS3 />
            <ShopBannerSectionS2 />
            <ProcessSectionS2 />
            <ProjectSectionS3 />
            <ProductSectionS4
                addToCartProduct={addToCartProduct}
                products={products}
            />
            <FeatureSectionS2 />
            <TestimonialSectionS3 />
            <BlogSectionS3 hclass={'blog-section-3 section-padding'} SubClass="blog-wrapper" />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default connect(null, { addToCart })(HomePage3);
export { HomePage3 as InkMeHomePage3 };
