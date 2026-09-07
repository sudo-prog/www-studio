import * as React from 'react';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.min.css';

import logo1 from '../../../img/brand/brand-logo-11.png'
import logo2 from '../../../img/brand/brand-logo-12.png'
import logo3 from '../../../img/brand/brand-logo-13.png'
import logo4 from '../../../img/brand/brand-logo-14.png'
import logo5 from '../../../img/brand/brand-logo-15.png'
import logo6 from '../../../img/brand/brand-logo-16.png'
import logo7 from '../../../img/brand/brand-logo-17.png'

const BrandSectionS2 = () => {

    useEffect(() => {
        const brandSlider3 = new Swiper(".brand-slider-3", {
            spaceBetween: 30,
            speed: 2000,
            loop: true,
            autoplay: {
                delay: 1000,
                disableOnInteraction: false,
            },
            breakpoints: {
                1399: {
                    slidesPerView: 7,
                },
                1199: {
                    slidesPerView: 6,
                },
                991: {
                    slidesPerView: 5,
                },
                767: {
                    slidesPerView: 4,
                },
                575: {
                    slidesPerView: 3,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    
    }, []);



    return (


        <div className="brand-section">
            <div className="brand-wrapper-3">
                <div className="swiper brand-slider-3">
                    <div className="swiper-wrapper">
                        <div className="swiper-slide">
                            <div className="brand-image">
                                <img src={logo1} alt="img" />
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="brand-image">
                                <img src={logo1} alt="img" />
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="brand-image">
                                <img src={logo2} alt="img" />
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="brand-image">
                                <img src={logo3} alt="img" />
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="brand-image">
                                <img src={logo4} alt="img" />
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="brand-image">
                                <img src={logo5} alt="img" />
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="brand-image">
                                <img src={logo6} alt="img" />
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="brand-image">
                                <img src={logo7} alt="img" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default BrandSectionS2;
export { BrandSectionS2 as InkMeBrandSectionS2 };
