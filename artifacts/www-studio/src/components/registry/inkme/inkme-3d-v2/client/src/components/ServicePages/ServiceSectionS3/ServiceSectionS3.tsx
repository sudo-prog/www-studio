import * as React from 'react';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.min.css';
import { Link } from 'react-router-dom'
import Services from "../../../api/Services";

import Sr1 from '../../../img/service/left-bg.png'
import Sbg from '../../../img/service/service-bg-2.jpg'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}
const ServiceSectionS3 = () => {

    useEffect(() => {
        const serviceSlider2 = new Swiper(".service-slider-2", {
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
                1199: {
                    slidesPerView: 3,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1,
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
        <section className="service-section-2 bg-cover fix section-padding" style={{ backgroundImage: `url(${Sbg})` }}>
            <div className="left-bg">
                <img src={Sr1} alt="img" />
            </div>
            <div className="container">
                <div className="section-title text-center">
                    <h6 className="bg-2 wow fadeInUp">Digital printing Service</h6>
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                        Our Populer Print Service <br />
                        Complete Solution
                    </h2>
                </div>
                <div className="swiper service-slider-2">
                    <div className="swiper-wrapper">
                        {Services.slice(9, 13).map((service, sitem) => (
                            <div className="swiper-slide" key={sitem}>
                                <div className="service-box-items">
                                    <h3><Link onClick={ClickHandler} to={`/service-details/${service.slug}`}>Printing Service</Link></h3>
                                    <div className="service-image">
                                        <img src={service.sImg} alt="img" />
                                    </div>
                                    <div className="service-content">
                                        <p>
                                            {service.description}
                                        </p>
                                        <Link onClick={ClickHandler} to={`/service-details/${service.slug}`} className="service-btn">Read More <i className="fa-solid fa-arrow-right"></i></Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                    <div className="swiper-dot pt-5">
                        <div className="dot"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default ServiceSectionS3;
export { ServiceSectionS3 as InkMeServiceSectionS3 };
