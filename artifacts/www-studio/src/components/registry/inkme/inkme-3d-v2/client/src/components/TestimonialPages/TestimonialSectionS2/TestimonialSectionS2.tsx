import * as React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Autoplay } from "swiper";
import "swiper/swiper-bundle.min.css";

import Ts1 from '../../../img/testimonial/client-2.png'
import Ts2 from '../../../img/testimonial/client-3.png'
import Ts3 from '../../../img/testimonial/client-4.png'
import Ts4 from '../../../img/testimonial/client-5.png'
import Ts5 from '../../../img/testimonial/client-6.png'
import Ts6 from '../../../img/testimonial/line-shape.png'
import Ts7 from '../../../img/testimonial/line-shape-2.png'
import Tclient1 from '../../../img/testimonial/client-1.png'
import Tclient2 from '../../../img/testimonial/client-2.png'
import Tclient3 from '../../../img/testimonial/client-3.png'

SwiperCore.use([Navigation, Autoplay]);
const TestimonialSectionS2 = () => {
    useEffect(() => {

    }, []);

    return (
        <section className="testimonial-section-2 section-padding">
            <div className="client-1">
                <img src={Ts1} alt="img" />
            </div>
            <div className="client-2">
                <img src={Ts2} alt="img" />
            </div>
            <div className="client-3">
                <img src={Ts3} alt="img" />
            </div>
            <div className="client-4">
                <img src={Ts4} alt="img" />
            </div>
            <div className="client-5">
                <img src={Ts5} alt="img" />
            </div>
            <div className="line-shape">
                <img src={Ts6} alt="img" />
            </div>
            <div className="line-shape-2">
                <img src={Ts7} alt="img" />
            </div>
            <div className="container">
                <div className="section-title text-center">
                    <h6 className="wow fadeInUp">Digital printing Service</h6>
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                        What Our Client’s Says <br />
                        About Company
                    </h2>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="swiper testimonial-slider-2">
                            <Swiper
                                spaceBetween={30}
                                speed={2000}
                                loop={true}
                                autoplay={{
                                    delay: 1000,
                                    disableOnInteraction: false,
                                }}
                                navigation={{
                                    nextEl: ".array-next",
                                    prevEl: ".array-prev",
                                }}
                            >
                                <SwiperSlide>
                                    <div className="testimonial-box-items">
                                        <div className="overlay-style"></div>
                                        <div className="overlay-style-2"></div>
                                        <div
                                            className="client-img bg-cover"
                                            style={{ backgroundImage: `url(${Tclient1})` }}
                                        ></div>
                                        <p>
                                            The experience with Ave has been nothing short of amazing. So much better than other themes I’ve used – wish I had seen this one first and saved my wasted time and money on other themes! I’d recommend this theme in a heartbeat!
                                        </p>
                                        <div className="client-content">
                                            <h4>Mathias Herasen</h4>
                                            <span>ThemeForest Exclusive</span>
                                        </div>
                                    </div>
                                </SwiperSlide>

                                <SwiperSlide>
                                    <div className="testimonial-box-items">
                                        <div className="overlay-style"></div>
                                        <div className="overlay-style-2"></div>
                                        <div
                                            className="client-img bg-cover"
                                            style={{ backgroundImage: `url(${Tclient2})` }}
                                        ></div>
                                        <p>
                                            The experience with Ave has been nothing short of amazing. So much better than other themes I’ve used – wish I had seen this one first and saved my wasted time and money on other themes! I’d recommend this theme in a heartbeat!
                                        </p>
                                        <div className="client-content">
                                            <h4>Shikhon Islam</h4>
                                            <span>Web Developer</span>
                                        </div>
                                    </div>
                                </SwiperSlide>

                                <SwiperSlide>
                                    <div className="testimonial-box-items">
                                        <div className="overlay-style"></div>
                                        <div className="overlay-style-2"></div>
                                        <div
                                            className="client-img bg-cover"
                                            style={{ backgroundImage: `url(${Tclient3})` }}
                                        ></div>
                                        <p>
                                            The experience with Ave has been nothing short of amazing. So much better than other themes I’ve used – wish I had seen this one first and saved my wasted time and money on other themes! I’d recommend this theme in a heartbeat!
                                        </p>
                                        <div className="client-content">
                                            <h4>Kawser Ahmed</h4>
                                            <span>ThemeForest Exclusive</span>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </Swiper>

                            <div className="array-button justify-content-center">
                                <button className="array-prev">
                                    <i className="fa-regular fa-arrow-left-long"></i>
                                </button>
                                <button className="array-next">
                                    <i className="fa-regular fa-arrow-right-long"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default TestimonialSectionS2;



export { TestimonialSectionS2 as InkMeTestimonialSectionS2 };
