import React from 'react';
import { Link } from 'react-router-dom';

import F1 from '../../../img/feature/01.png'
import F2 from '../../../img/feature/line-shape-2.png'
import F3 from '../../../img/feature/customer-shape.png'
import F4 from '../../../img/feature/color_cycle.png'
import F5 from '../../../img/feature/box.png'
import F6 from '../../../img/feature/StickersV30.png'
import F7 from '../../../img/feature/t-shirt-shape.png'
import F8 from '../../../img/line-2.png'

const ClickHandler = () => {
    window.scrollTo(10, 0);
};

const FeatureSectionS2 = () => {
    return (
        <section className="feature-section-3 fix section-padding pt-0">
            <div className="container">
                <div className="feature-wrapper-3">
                    <div className="row g-4 align-items-center">
                        <div className="col-lg-6 wow img-custom-anim-top" data-wow-duration="1.5s" data-wow-delay="0.1s">
                            <div className="feature-image">
                                <img src={F1} alt="img" />
                                <div className="line-shape">
                                    <img src={F2} alt="" />
                                </div>
                                <div className="customer-shape">
                                    <img src={F3} alt="img" />
                                </div>
                                <div className="color-cycle">
                                    <img src={F4} alt="img" />
                                </div>
                                <div className="box-shape">
                                    <img src={F5} alt="img" />
                                </div>
                                <div className="stickers-shape">
                                    <img src={F6} alt="img" />
                                </div>
                                <div className="shirt-shape">
                                    <img src={F7} alt="img" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="feature-content">
                                <div className="section-title">
                                    <h6 className="bg-2 wow fadeInUp">Digital printing Service</h6>
                                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                                        Creating The Perfect
                                        <span>Custom Product <img src={F8} alt="img" /></span>
                                    </h2>
                                </div>
                                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                                    A full administration printing background. Print shirts for
                                    or your online business Beautiful, customizable template,
                                </p>
                                <ul className="list-items wow fadeInUp" data-wow-delay=".3s">
                                    <li>
                                        <i className="fa-regular fa-check"></i>
                                        Top quality prints using the latest technology
                                    </li>
                                    <li>
                                        <i className="fa-regular fa-check"></i>
                                        Mix and match colors, sizes, and designs
                                    </li>
                                    <li>
                                        <i className="fa-regular fa-check"></i>
                                        custom branding tools & smooth automation
                                    </li>
                                </ul>
                                <Link onClick={ClickHandler} to="/shop" className="theme-btn wow fadeInUp" data-wow-delay=".5s">Order Now</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default FeatureSectionS2;
export { FeatureSectionS2 as InkMeFeatureSectionS2 };
