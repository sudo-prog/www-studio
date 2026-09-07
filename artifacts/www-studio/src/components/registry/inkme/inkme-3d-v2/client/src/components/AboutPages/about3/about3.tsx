import React from 'react';
import { Link } from 'react-router-dom';

import lineshape from '../../../img/line-3.png'
import ratting from '../../../img/ratting-shape.png'
import brush from '../../../img/brush-front.png'
import demand from '../../../img/demand-shape.png'
import homedemand from '../../../img/home-demand.png'
import custom from '../../../img/custom-print-img.png'
import lineab from '../../../img/line-2.png'
import lineab1 from '../../../img/icon/09.svg'
import lineab2 from '../../../img/icon/10.svg'
import lineab3 from '../../../img/icon/16.svg'

const about3 = () => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }
    return (
        <section className="product-demand-section fix section-padding">
            <div className="line-shape">
                <img src={lineshape} alt="img" />
            </div>
            <div className="container">
                <div className="product-demand-wrapper">
                    <div className="row g-4">
                        <div className="col-xl-5 col-lg-6">
                            <div className="product-demand-image">
                                <img src={custom} alt="img" className="border-radius-22 wow img-custom-anim-top" />
                                <div className="ratting-shape">
                                    <img src={ratting} alt="img" />
                                </div>
                                <div className="brush-shape">
                                    <img src={brush} alt="img" />
                                </div>
                                <div className="demand-shape float-bob-y">
                                    <img src={demand} alt="img" />
                                </div>
                                <div className="home-demand-shape float-bob-x">
                                    <img src={homedemand} alt="img" />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-7 col-lg-6">
                            <div className="product-demand-content">
                                <div className="section-title">
                                    <h2 className="wow fadeInUp" data-wow-delay=".3s">
                                        Create And Sell Custom On-
                                        <span> Demand Products <img src={lineab} alt="img" /></span>
                                    </h2>
                                </div>
                                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                                    A full administration printing background. Print shirts for yourself <br />
                                    or your online business Beautiful, customizable template,
                                </p>
                                <div className="icon-wrapper">
                                    <div className="icon-items wow fadeInUp" data-wow-delay=".3s">
                                        <div className="icon">
                                            <img src={lineab1} alt="img" />
                                        </div>
                                        <h4>
                                            Mix and match colors, <br />
                                            sizes, and designs
                                        </h4>
                                    </div>
                                    <div className="icon-items wow fadeInUp" data-wow-delay=".5s">
                                        <div className="icon">
                                            <img src={lineab2} alt="img" />
                                        </div>
                                        <h4>
                                            Top quality prints using <br />
                                            the latest technology
                                        </h4>
                                    </div>
                                </div>
                                <ul className="wow fadeInUp" data-wow-delay=".3s">
                                    <li>
                                        <img src={lineab3} alt="img" />
                                        Printing programs tailored to your company needs
                                    </li>
                                    <li>
                                        <img src={lineab3} alt="img" />
                                        Large paper & stock selection & Unique Print
                                    </li>
                                </ul>
                                <Link onClick={ClickHandler} to="/about" className="theme-btn wow fadeInUp" data-wow-delay=".5s">more about us</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default about3;
export { about3 as InkMeabout3 };
