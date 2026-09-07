import * as React from 'react';
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.min.css';

import Bg from '../../../img/testimonial/testimonial-bg-2.jpg'

const TestimonialSectionS3 = () => {

    useEffect(() => {
        const testimonialSlider3 = new Swiper(".testimonial-slider-3", {
            spaceBetween: 30,
            speed: 2000,
            loop: true,
            autoplay: {
                delay: 1000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".dot",
                clickable: true,
            },
            breakpoints: {
                1399: {
                    slidesPerView: 3,
                },
                1199: {
                    slidesPerView: 2,
                },
                991: {
                    slidesPerView: 2,
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
    }, [])

    return (
        <section className="testimonial-section-3 section-padding fix bg-cover" style={{ backgroundImage: `url(${Bg})` }}>
            <div className="container">
                <div className="section-title text-center">
                    <h6 className="bg-3 wow fadeInUp">Digital printing Service</h6>
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                        Why People Say About Our <br />
                        Business Services
                    </h2>
                </div>
            </div>
            <div className="swiper testimonial-slider-3">
                <div className="swiper-wrapper">
                    <div className="swiper-slide">
                        <div className="testimonial-box-items-2">
                            <div className="clinet-info-items">
                                <div className="content">
                                    <h4>william camel</h4>
                                    <span>Head of Design at Zazoo</span>
                                </div>
                                <div className="star">
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star color-2"></i>
                                </div>
                            </div>
                            <h3>
                                I had a great experience <br />
                                with printSpace!
                            </h3>
                            <p>
                                Good Time is very good in what they're doing and
                                more than happy to challenge and push you to
                                think about your decisions both from usabil
                            </p>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="testimonial-box-items-2">
                            <div className="clinet-info-items">
                                <div className="content">
                                    <h4>Shikhon Islam</h4>
                                    <span>Web Developer</span>
                                </div>
                                <div className="star">
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star color-2"></i>
                                </div>
                            </div>
                            <h3>
                                I had a great experience <br />
                                with printSpace!
                            </h3>
                            <p>
                                Good Time is very good in what they're doing and
                                more than happy to challenge and push you to
                                think about your decisions both from usabil
                            </p>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="testimonial-box-items-2">
                            <div className="clinet-info-items">
                                <div className="content">
                                    <h4>william camel</h4>
                                    <span>Head of Design at Zazoo</span>
                                </div>
                                <div className="star">
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star color-2"></i>
                                </div>
                            </div>
                            <h3>
                                I had a great experience <br />
                                with printSpace!
                            </h3>
                            <p>
                                Good Time is very good in what they're doing and
                                more than happy to challenge and push you to
                                think about your decisions both from usabil
                            </p>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="testimonial-box-items-2">
                            <div className="clinet-info-items">
                                <div className="content">
                                    <h4>Shikhon Islam</h4>
                                    <span>Web Developer</span>
                                </div>
                                <div className="star">
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star color-2"></i>
                                </div>
                            </div>
                            <h3>
                                I had a great experience <br />
                                with printSpace!
                            </h3>
                            <p>
                                Good Time is very good in what they're doing and
                                more than happy to challenge and push you to
                                think about your decisions both from usabil
                            </p>
                        </div>
                    </div>
                </div>
                <div className="swiper-dot-2 text-center pt-5">
                    <div className="dot"></div>
                </div>
            </div>
        </section>
    );
};

// export default TestimonialSectionS3;
export { TestimonialSectionS3 as InkMeTestimonialSectionS3 };
