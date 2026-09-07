import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Autoplay } from 'swiper';
import 'swiper/swiper-bundle.min.css';



import TsBg from '../../../img/testimonial/testimonial-bg.jpg';
import Line1 from '../../../img/line.png';
import Line2 from '../../../img/testimonial/line.png';
import TS2 from '../../../img/testimonial/testimonial.png';
import TS3 from '../../../img/testimonial/work-shape.png';

// Install Swiper modules
SwiperCore.use([Navigation, Autoplay]);

const Testimonial = () => {



    return (
        <section
            className="testimonial-section section-padding fix bg-cover"
            style={{ backgroundImage: `url(${TsBg})` }}
        >
            <div className="array-button">
                <button className="array-prev"><i className="fa-regular fa-chevron-left"></i></button>
                <button className="array-next"><i className="fa-regular fa-chevron-right"></i></button>
            </div>
            <div className="container">
                <div className="testimonial-wrapper">
                    <div className="row g-4 justify-content-between align-items-center">
                        <div className="col-lg-7">
                            <div className="section-title">
                                <h6 className="wow fadeInUp">More about us</h6>
                                <h2 className="text-white split-text right">
                                    Create Stunning Print For <br />
                                    <span>Your Business <img src={Line1} alt="img" /></span>
                                </h2>
                            </div>
                            <Swiper
                                spaceBetween={30}
                                speed={2000}
                                loop={true}
                                autoplay={{
                                    delay: 1000,
                                    disableOnInteraction: false,
                                }}
                                navigation={{
                                    nextEl: '.array-next',
                                    prevEl: '.array-prev',
                                }}
                                className="testimonial-slider"
                            >
                                <SwiperSlide>
                                    <div className="testimonial-content mt-4 mt-md-0">
                                        <p>
                                            Climb the mountain not to plant your flag but to embrace
                                            the ways challenge, enjoy the air, and behold the. Climb it
                                            see the world, not so the world can see you. This is due to
                                            excellent service competitive pricing their
                                        </p>
                                        <div className="client-info">
                                            <h3>
                                                Robert J. Hare/ <span>Graphics Designer</span>
                                            </h3>
                                            <div className="star">
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="testimonial-content mt-4 mt-md-0">
                                        <p>
                                            Climb the mountain not to plant your flag but to embrace
                                            the ways challenge, enjoy the air, and behold the. Climb it
                                            see the world, not so the world can see you. This is due to
                                            excellent service competitive pricing their
                                        </p>
                                        <div className="client-info">
                                            <h3>
                                                Robert J. Hare/ <span>Graphics Designer</span>
                                            </h3>
                                            <div className="star">
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="testimonial-content mt-4 mt-md-0">
                                        <p>
                                            Climb the mountain not to plant your flag but to embrace
                                            the ways challenge, enjoy the air, and behold the. Climb it
                                            see the world, not so the world can see you. This is due to
                                            excellent service competitive pricing their
                                        </p>
                                        <div className="client-info">
                                            <h3>
                                                Robert J. Hare/ <span>Graphics Designer</span>
                                            </h3>
                                            <div className="star">
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                        </div>
                        <div className="col-lg-5">
                            <div className="testimoni-image-items ">
                                <div className="line-shape">
                                    <img src={Line2} alt="shape-img" />
                                </div>
                                <div className="testimoni-image image-anime">
                                    <img src={TS2} alt="img" data-speed="0.8" />
                                </div>
                                <h2 className="work-shape">
                                    <img src={TS3} alt="img" />
                                </h2>
                                <div className="icon">
                                    <i className="fa-solid fa-quote-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default Testimonial;
export { Testimonial as InkMeTestimonial };
