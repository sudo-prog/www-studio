import React from 'react';

import Wp1 from '../../../img/work-process/01.jpg'
import Wp2 from '../../../img/work-process/02.jpg'
import Wp3 from '../../../img/work-process/03.jpg'

const ProcessSectionS2 = () => {
    return (
        <section className="work-process-section section-padding fix">
            <div className="container">
                <div className="section-title text-center">
                    {/* <h6 className="bg-2 wow fadeInUp">Digital printing Service</h6> */}
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">How we operate and process<br />
                        cho khách hàng
                    </h2>
                </div>
                <div className="work-process-wrapper">
                    <div className="row">
                        <div className="col-xl-4 col-lg-6 col-ms-6 wow fadeInUp" data-wow-delay=".3s">
                            <div className="work-process-box-items">
                                <div className="thumb">
                                    <img src={Wp1} alt="img" />
                                </div>
                                <div className="content">
                                    <h3>Select product</h3>
                                    <p>Select products that fit the customer's needs</p>
                                </div>
                                <div className="number">
                                    01
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-ms-6 wow fadeInUp" data-wow-delay=".5s">
                            <div className="work-process-box-items active">
                                <div className="thumb">
                                    <img src={Wp2} alt="img" />
                                </div>
                                <div className="content">
                                    <h3>Design & review</h3>
                                    <p>Design products according to customer requirements and review to ensure quality</p>
                                </div>
                                <div className="number">
                                    02
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-ms-6 wow fadeInUp" data-wow-delay=".7s">
                            <div className="work-process-box-items">
                                <div className="thumb">
                                    <img src={Wp3} alt="img" />
                                </div>
                                <div className="content">
                                    <h3>Giao hàng</h3>
                                    <p>Deliver products to customers at the correct time and address</p>
                                </div>
                                <div className="number">
                                    03
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default ProcessSectionS2;
export { ProcessSectionS2 as InkMeProcessSectionS2 };
