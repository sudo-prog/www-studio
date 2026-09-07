import React from 'react';
import { Link } from 'react-router-dom';
import Services from "../../../api/Services";

import Fi1 from '../../../img/footer/dot.png'
import Fi2 from '../../../img/footer/footer-shape-1.png'
import Fi3 from '../../../img/footer/footer-shape-2.png'
import Logo from '../../../img/logo/inkme-logo-gradient.png'
import Fi4 from '../../../img/QRcode.png'
import Fi5 from '../../../img/apple.png'
import Fi6 from '../../../img/play-store.png'
import Fi7 from '../../../img/card.png'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="dot-shape">
                <img src={Fi1} alt="img" />
            </div>
            <div className="footer-shape-1">
                <img src={Fi2} alt="img" />
            </div>
            <div className="footer-shape-2">
                <img src={Fi3} alt="img" />
            </div>
            <div className="container">
                <div className="footer-widgets-wrapper">
                    <div className="row">
                        <div className="col-xl-3 col-sm-6 col-md-6 col-lg-4" >
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <Link to="/home">
                                        <img src={Logo} alt="logo-img" style={{ width: '-webkit-fill-available' }} />
                                    </Link>
                                </div>
                                <div className="footer-content">
                                    <p>InkMe is the first 3D printing company in Vietnam, providing high-quality 3D printing services at competitive prices.</p>
                                    <ul className="contact-list">
                                        <li>
                                            <i className="fa-sharp fa-solid fa-phone-volume"></i>
                                            <a href="tel:+84968338829">+84 968 3388 29</a>
                                        </li>
                                        <li>
                                            <i className="fa-sharp fa-solid fa-envelope"></i>
                                            <a href="mailto:datlacve2@gmail.com" className="link">datlacve2@gmail.com</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 ps-lg-5 col-sm-6 col-md-6 col-lg-4">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>Links</h3>
                                </div>
                                <ul className="list-items">
                                    {Services.slice(0, 5).map((service, sitem) => (
                                        <li key={sitem}>
                                            <Link to={`/service-details/${service.slug}`}>
                                                {service.title}
                                            </Link>
                                        </li>
                                    ))}


                                </ul>
                            </div>
                        </div>
                        <div className="col-xl-3 ps-lg-4 col-sm-6 col-md-6 col-lg-4" >
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>Community</h3>
                                </div>
                                <ul className="list-items">
                                    <li>
                                        <Link to="/contact">Help Center</Link>
                                    </li>
                                    <li>
                                        <Link to="/contact">Partners</Link>
                                    </li>
                                    <li>
                                        <Link to="/contact">
                                            Góp ý
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/news">
                                            Blog
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/contact">Newsletter</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-md-6 col-lg-4">
                            <div className="single-footer-widget">
                                <div className="widget-head">
                                    <h3>Contact</h3>
                                </div>
                                <div className="footer-content">
                                    <div className="scan-items">
                                        <div className="scan-img">
                                            <img src={Fi4} alt="img" />
                                        </div>
                                        <ul className="store-list">
                                            <li>
                                                <Link to="/contact">
                                                    <img src={Fi5} alt="img" />
                                                    App Store (Chưa có)
                                                </Link>
                                            </li>
                                            <li className="active">
                                                <Link to="/contact">
                                                    <img src={Fi6} alt="img" />
                                                    Google play (Chưa có)   
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="brand-logo">
                                        <img src={Fi7} alt="img" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <Link to="/" id="scrollUp" className="scroll-icon" onClick={ClickHandler}>
                        <i className="fa-solid fa-chevrons-up"></i>
                    </Link>
                    <div className="footer-wrapper d-flex align-items-center justify-content-between">
                        <p className="fadeInLeft color-2" >
                            Copyright <span>@2025</span> <Link to="/">InkMe</Link> All Rights Reserved
                        </p>
                        <div className="social-icon d-flex align-items-center fadeInRight" >
                            <Link to="/"><i className="fab fa-facebook-f"></i></Link>
                            <Link to="/"><i className="fa-brands fa-vimeo-v"></i></Link>
                            <Link to="/"><i className="fab fa-twitter"></i></Link>
                            <Link to="/"><i className="fa-brands fa-linkedin-in"></i></Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// export default Footer;
export { Footer as InkMeFooter };
