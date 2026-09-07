import React from 'react';
import { Link } from 'react-router-dom';

import Bg from '../../img/about/about-feature-bg.jpg'
import Line from '../../img/line.png'
import Img1 from '../../img/about/about-man-img.png'
import Img2 from '../../img/about/right_content.png'

const QualityPrintingSection = () => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <section className="about-section section-padding bg-cover" style={{ backgroundImage: `url(${Bg})` }}>
            <div className="container">
                <div className="about-wrapper-2 style-2">
                    <div className="row g-4">
                        <div className="col-lg-6">
                            <div className="about-content">
                                <div className="section-title">
                                    <h6 className="wow fadeInUp">More about us</h6>
                                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                                        Quality Printing &
                                        <span> Promotional Products <img src={Line} alt="img" /></span>
                                    </h2>
                                </div>
                                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                                    A full administration printing background. Print <br />
                                        or your online business Beautiful, customizabl
                                </p>
                                <ul className="about-list wow fadeInUp" data-wow-delay=".7s">
                                    <li>
                                        <i className="fa-solid fa-check"></i>
                                        Large paper & stock selection & Unique Print
                                    </li>
                                    <li>
                                        <i className="fa-solid fa-check"></i>
                                        Printing programs tailored to your company ne
                                    </li>
                                    <li>
                                        <i className="fa-solid fa-check"></i>
                                        Customer places their order Connect your store
                                    </li>
                                </ul>
                                <div className="about-author d-block">
                                    <Link onClick={ClickHandler} to="/about" className="theme-btn wow fadeInUp" data-wow-delay=".3s">more about us</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="about-feature-image-2">
                                <img src={Img1} alt="img"  className="wow img-custom-anim-top" />
                                    <div className="bg-shape">
                                    <img src={Img1} alt="shape-img" />
                                    </div>
                                    <div className="content-box float-bob-x">
                                    <img src={Img2} alt="img" />
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default QualityPrintingSection;
export { QualityPrintingSection as InkMeQualityPrintingSection };
