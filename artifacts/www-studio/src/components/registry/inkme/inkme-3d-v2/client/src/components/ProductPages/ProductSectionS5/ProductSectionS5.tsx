import * as React from 'react';
import { Link } from 'react-router-dom';
import Swiper from 'swiper/bundle';  // Make sure to install Swiper with 'npm install swiper'
import 'swiper/swiper-bundle.min.css'; // Import Swiper styles



const ProductSectionS5 = ({ products }) => {

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    useEffect(() => {
        const shopSlider = new Swiper('.shop-slider', {
            spaceBetween: 30,
            speed: 2000,
            loop: true,
            autoplay: {
                delay: 1000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.array-next',
                prevEl: '.array-prev',
            },
            breakpoints: {
                1399: {
                    slidesPerView: 5,
                },
                1199: {
                    slidesPerView: 4,
                },
                991: {
                    slidesPerView: 3,
                },
                767: {
                    slidesPerView: 2,
                },
                575: {
                    slidesPerView: 1,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }, []);

    return (
        <section className="popular-product-section fix section-padding">
            <div className="container">
                <div className="section-title text-center">
                    <h6 className="bg-2 wow fadeInUp">Digital printing Service</h6>
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                        Popular Brand Design <br/>
                            & Print Products
                    </h2>
                </div>
                <div className="array-button justify-content-center">
                    <button className="array-prev"><i className="fa-regular fa-arrow-left-long"></i></button>
                    <button className="array-next"><i className="fa-regular fa-arrow-right-long"></i></button>
                </div>
                <div className="shop-wrapper shop-wrapper-2">
                    <div className="swiper shop-slider">
                        <div className="swiper-wrapper">
                            {products.length > 0 &&
                                products.slice(18, 24).map((product, index) => (
                                    <div className="swiper-slide" key={index}>
                                        <div className="shop-box-items style-2">
                                            <div className="shop-image-2">
                                                <img src={product.proImg} alt="img" />
                                            </div>
                                            <div className="shop-content">
                                                <h3> <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                    {product.title}
                                                </Link>
                                                </h3>
                                                <p>312 Product</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <h5 className="shop-bottom-title style-2 wow fadeInUp" data-wow-delay=".3s">
                    Free shipping on all U.S. orders <span>$50+</span>
                </h5>
            </div>
        </section>
    );
};

// export default ProductSectionS5;




export { ProductSectionS5 as InkMeProductSectionS5 };
