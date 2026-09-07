import * as React from 'react';
import { Link } from 'react-router-dom';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.min.css';

import Herobg from '../../../img/hero/hero-bg-2.jpg';
import Line from '../../../img/hero/line.png';
import Bar from '../../../img/hero/bar.png';
import Tshirt from '../../../img/hero/t-shirt.png';
import Tshirt1 from '../../../img/hero/t-shirt-2.png';
import Tshirt2 from '../../../img/hero/t-shirt-3.png';
import Bucket from '../../../img/hero/bucket-front-color.png';
import Mockup from '../../../img/hero/mockup-generator.png';
import Mockup1 from '../../../img/hero/stiker.png';
import Mockup2 from '../../../img/hero/cap.png';

const Hero3 = () => {

    useEffect(() => {
        const sliderswiper = new Swiper('.hero-slider-2', {
            speed: 1500,
            loop: true,
            slidesPerView: 1,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            effect: 'fade',
            breakpoints: {
                1600: { slidesPerView: 1 },
                1400: { slidesPerView: 1 },
                1200: { slidesPerView: 1 },
                992: { slidesPerView: 1 },
                768: { slidesPerView: 1 },
                576: { slidesPerView: 1 },
                0: { slidesPerView: 1 }
            },
            pagination: {
                el: ".tp-slider-2-dots",
                clickable: true,
            },
            a11y: false,
        });
    }, []);

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    };

    return (
        <section className="hero-section hero-3 bg-cover" style={{ backgroundImage: `url(${Herobg})` }}>
            <div className="line-shape">
                <img src={Line} alt="line shape" />
            </div>
            <div className="container">
                <div className="swiper hero-slider-2">
                    <div className="swiper-wrapper">
                        <div className="swiper-slide">
                            <div className="row g-4 justify-content-between align-items-center">
                                <div className="col-xxl-6 col-xl-6 col-lg-6">
                                    <div className="hero-content">
                                        <h6>Digital printing Service</h6>
                                        <h1>
                                            Custom T-shirt,
                                            <span>simplified.. <img src={Bar} alt="bar shape" /></span>
                                        </h1>
                                        <p>
                                            Beautiful, customizable template, with a ton of web blocks <br />
                                            to create an amazing website that looks
                                        </p>
                                    </div>
                                    <div className="hero-button">
                                        <Link onClick={ClickHandler} to="/shop" className="theme-btn">Order Today</Link>
                                    </div>
                                </div>
                                <div className="col-xxl-5 col-xl-6 col-lg-6">
                                    <div className="hero-image-items">
                                        <div className="hero-image">
                                            <img src={Tshirt} alt="t-shirt" />
                                        </div>
                                        <div className="color-box">
                                            <img src={Bucket} alt="bucket color" />
                                        </div>
                                        <div className="mockup-shape">
                                            <img src={Mockup} alt="mockup" />
                                        </div>
                                        <div className="stickers-shape">
                                            <img src={Mockup1} alt="sticker" />
                                        </div>
                                        <div className="cap-shape">
                                            <img src={Mockup2} alt="cap" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="row g-4 justify-content-between align-items-center">
                                <div className="col-xxl-6 col-xl-6 col-lg-6">
                                    <div className="hero-content">
                                        <h6>Digital printing Service</h6>
                                        <h1>
                                            Custom T-shirt,
                                            <span>simplified.. <img src={Bar} alt="bar shape" /></span>
                                        </h1>
                                        <p>
                                            Beautiful, customizable template, with a ton of web blocks <br />
                                            to create an amazing website that looks
                                        </p>
                                    </div>
                                    <div className="hero-button">
                                        <Link onClick={ClickHandler} to="/shop" className="theme-btn">Order Today</Link>
                                    </div>
                                </div>
                                <div className="col-xxl-5 col-xl-6 col-lg-6">
                                    <div className="hero-image-items">
                                        <div className="hero-image">
                                            <img src={Tshirt1} alt="t-shirt" />
                                        </div>
                                        <div className="color-box">
                                            <img src={Bucket} alt="bucket color" />
                                        </div>
                                        <div className="mockup-shape">
                                            <img src={Mockup} alt="mockup" />
                                        </div>
                                        <div className="stickers-shape">
                                            <img src={Mockup1} alt="sticker" />
                                        </div>
                                        <div className="cap-shape">
                                            <img src={Mockup2} alt="cap" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="swiper-slide">
                            <div className="row g-4 justify-content-between align-items-center">
                                <div className="col-xxl-6 col-xl-6 col-lg-6">
                                    <div className="hero-content">
                                        <h6>Digital printing Service</h6>
                                        <h1>
                                            Custom T-shirt,
                                            <span>simplified.. <img src={Bar} alt="bar shape" /></span>
                                        </h1>
                                        <p>
                                            Beautiful, customizable template, with a ton of web blocks <br />
                                            to create an amazing website that looks
                                        </p>
                                    </div>
                                    <div className="hero-button">
                                        <Link onClick={ClickHandler} to="/shop" className="theme-btn">Order Today</Link>
                                    </div>
                                </div>
                                <div className="col-xxl-5 col-xl-6 col-lg-6">
                                    <div className="hero-image-items">
                                        <div className="hero-image">
                                            <img src={Tshirt2} alt="t-shirt" />
                                        </div>
                                        <div className="color-box">
                                            <img src={Bucket} alt="bucket color" />
                                        </div>
                                        <div className="mockup-shape">
                                            <img src={Mockup} alt="mockup" />
                                        </div>
                                        <div className="stickers-shape">
                                            <img src={Mockup1} alt="sticker" />
                                        </div>
                                        <div className="cap-shape">
                                            <img src={Mockup2} alt="cap" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default Hero3;
export { Hero3 as InkMeHero3 };
