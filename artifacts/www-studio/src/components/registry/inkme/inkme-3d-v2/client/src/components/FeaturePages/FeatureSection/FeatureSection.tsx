import React from 'react';

import Feature1 from '../../../img/feature/tshirt.png'
import Feature2 from '../../../img/feature/tshirt-2.png'
import Feature3 from '../../../img/feature/return.png'

const FeatureSection = () => {
    return (
        <section className="feature-section fix section-padding">
            <div className="container">
                <div className="feature-wrapper">
                    <div className="row g-4">
                        <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                            <div className="feature-box-items">
                                <div className="icon">
                                    <img src={Feature1} alt="img" />
                                </div>
                                <div className="content">
                                    <h3>Select product</h3>
                                    <p>Printed on high-quality 100% cotton for a vibrant and durable all-day finish</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                            <div className="feature-box-items">
                                <div className="icon">
                                    <img src={Feature2} alt="img" />
                                </div>
                                <div className="content">
                                    <h3>Customize & Review</h3>
                                    <p>Customize the product to your liking and preview it to ensure satisfaction before printing.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                            <div className="feature-box-items">
                                <div className="icon">
                                    <img src={Feature3} alt="img" />
                                </div>
                                <div className="content">
                                    <h3>Ready for delivery</h3>
                                    <p>Products are always prepared and ready to be shipped to you as quickly as possible.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default FeatureSection;
export { FeatureSection as InkMeFeatureSection };
