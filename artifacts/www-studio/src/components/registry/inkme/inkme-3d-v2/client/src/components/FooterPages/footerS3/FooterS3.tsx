import React from 'react';
import { Link } from 'react-router-dom';
import Services from "../../../api/Services";

import Bgimg from '../../../img/footer/footer-bg-2.jpg'
import Shape1 from '../../../img/footer/line-shape.png'
import Shape2 from '../../../img/footer/star.png'
import Shape3 from '../../../img/mail.png'
import Logo from '../../../img/logo/inkme-logo-gradient.png'



const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const FooterS3 = () => {
    return (
        <footer className="footer-section style-2 bg-cover" style={{ backgroundImage: `url(${Bgimg})` }}>
            <div className="line-shape float-bob-y">
                <img src={Shape1} alt="img" />
            </div>
            <div className="star-shape float-bob-y">
                <img src={Shape2} alt="img" />
            </div>
            <div className="container">
                <div className="footer-newsletter-wrapper style-2">
                    <div className="newsletter-items wow fadeInUp" data-wow-delay=".3s">
                        <div className="icon">
                            <img src={Shape3} alt="img" />
                        </div>
                        <h2>Get the latest news<br />& Update</h2>
                    </div>
                    <div className="newsletter-input wow fadeInUp" data-wow-delay=".5s">
                        <input type="email" id="email22" placeholder="Email" />
                        <button className="newsletter-btn" type="submit">
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                <div className="footer-widgets-wrapper style-2">
                    <div className="row">
                        <div className="col-xl-3 col-sm-6 col-md-6 col-lg-4 wow fadeInUp" data-wow-delay=".2s">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <Link onClick={ClickHandler} to="/home">
                                        <img src={Logo} alt="logo-img" style={{ width: '-webkit-fill-available' }} />
                                    </Link>
                                </div>
                                <div className="footer-content">
                                    <p className="text-white">InkMe is the first 3D printing company in Vietnam, providing high-quality 3D printing services at competitive prices.</p>
                                    <div className="social-icon d-flex align-items-center">
                                        <Link onClick={ClickHandler} to="#"><i className="fab fa-facebook-f"></i></Link>
                                        <Link onClick={ClickHandler} to="#"><i className="fab fa-twitter"></i></Link>
                                        <Link onClick={ClickHandler} to="#"><i className="fa-brands fa-linkedin-in"></i></Link>
                                        <Link onClick={ClickHandler} to="#"><i className="fa-brands fa-youtube"></i></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 ps-lg-5 col-sm-6 col-md-6 col-lg-4 wow fadeInUp" data-wow-delay=".4s">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>Links</h3>
                                </div>
                                <ul className="list-items">
                                    {Services.slice(0, 5).map((service, sitem) => (
                                        <li key={sitem}>
                                            <Link onClick={ClickHandler} to={`/service-details/${service.slug}`}>
                                                {service.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-xl-3 ps-lg-4 col-sm-6 col-md-6 col-lg-4 wow fadeInUp" data-wow-delay=".6s">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>Community</h3>
                                </div>
                                <ul className="list-items">
                                    <li>
                                        <Link onClick={ClickHandler} to="/contact">
                                            Trung tâm trợ giúp
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={ClickHandler} to="/contact">
                                            Đối tác
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={ClickHandler} to="/contact">
                                            Góp ý
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={ClickHandler} to="/news">
                                            Blog
                                        </Link>
                                    </li>
                                    <li>
                                        <Link onClick={ClickHandler} to="/contact">
                                            Bản tin
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-md-6 col-lg-4 wow fadeInUp" data-wow-delay=".8s">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>Contact</h3>
                                </div>
                                <div className="footer-content">
                                    <p className="text-white">
                                        2972 Westheimer Rd. Santa Ana, <br />
                                        Illinois 85486
                                    </p>
                                    <ul className="contact-list">
                                        <li>
                                            <Link onClick={ClickHandler} to="#" className="link">contact@info.com</Link>
                                        </li>
                                        <li>
                                            <Link onClick={ClickHandler} to="tel:+8060008899">+806 (000) 88 99</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom style-2">
                    <Link onClick={ClickHandler} to="#" id="scrollUp" className="scroll-icon">
                        <i className="fa-solid fa-chevrons-up"></i>
                    </Link>
                    <div className="footer-wrapper d-flex align-items-center justify-content-between">
                        <p className="wow fadeInLeft" data-wow-delay=".3s">
                            Copyright <span>@2025</span> <Link onClick={ClickHandler} to="/home">InkMe</Link> All Rights Reserved
                        </p>
                        <ul className="footer-menu wow fadeInRight" data-wow-delay=".5s">
                            <li>
                                <Link onClick={ClickHandler} to="/">
                                    Câu hỏi thường gặp
                                </Link>
                            </li>
                            <li>
                                <Link onClick={ClickHandler} to="/contact">
                                    Cài đặt
                                </Link>
                            </li>
                            <li>
                                <Link onClick={ClickHandler} to="/contact">
                                    Quyền riêng tư
                                </Link>
                            </li>
                            <li>
                                <Link onClick={ClickHandler} to="/contact">
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// export default FooterS3;
export { FooterS3 as InkMeFooterS3 };
