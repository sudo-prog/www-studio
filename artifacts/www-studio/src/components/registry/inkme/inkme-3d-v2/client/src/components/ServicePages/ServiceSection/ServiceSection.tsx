import * as React from 'react';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.min.css';
import { Link } from 'react-router-dom'
import { MyContext } from '../../../context/MyContext';

import Shape from '../../../img/service/shape.png'
import Shape2 from '../../../img/line.png'


const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const ServiceSection = (props) => {
    const { categoryData } = useContext(MyContext);

    useEffect(() => {
        const serviceSlider = new Swiper('.service-slider', {
            spaceBetween: 30,
            speed: 2000,
            loop: true,
            autoplay: {
                delay: 1000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.dot',
                clickable: true,
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
                    slidesPerView: 2,
                },
                0: {
                    slidesPerView: 2,
                },
            },
        });
    }, []);


    return (
        <section className={"" + props.hclass} style={{ backgroundImage: `url(${props.Bg})` }}>
            <div className="shape-image">
                <img src={Shape} alt="img" />
            </div>
            <div className="container">
                <div className="section-title-area">
                    <div className="section-title">
                        {/* <h6 className="wow fadeInUp">More service us</h6> */}
                        <h2 className="wow fadeInUp" data-wow-delay=".3s">Collection<br />
                            <span>Best Selling<img src={Shape2} alt="img" /></span>
                        </h2>
                    </div>
                    <Link onClick={ClickHandler} to="/service" className="theme-btn wow fadeInUp" data-wow-delay=".5s">Xem tất cả</Link>
                </div>
            </div>
            <div className="service-wrapper">
                <div className="swiper service-slider">
                    <div className="swiper-wrapper">
                        {categoryData.map((category, sitem) => (
                            <div className="swiper-slide" key={sitem}>
                                <div className="service-card-items">
                                    <div className="service-cotent">
                                        <h3><Link onClick={ClickHandler} to={`/service-details/${category.slug}`}>{category.name}</Link></h3>
                                        <p className='text-truncate'>{category.description || 'No description'}</p>
                                    </div>
                                    <div className="service-image">
                                        <img src={category.images || 'https://via.placeholder.com/300x200'} alt={category.name} />
                                    </div>
                                    <div className="service-btn">
                                        <Link onClick={ClickHandler} to={`/service-details/${category.slug}`} className="link-btn">Xem thêm <i className="fa-solid fa-arrow-right"></i></Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

    );
}

// export default ServiceSection;
export { ServiceSection as InkMeServiceSection };
