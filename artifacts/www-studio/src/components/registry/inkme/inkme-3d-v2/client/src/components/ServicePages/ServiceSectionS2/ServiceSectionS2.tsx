import React from "react";
import { Link } from 'react-router-dom'
import Services from "../../../api/Services";

import Sshape1 from '../../../img/service/shape-1.png'
import Sshape2 from '../../../img/service/shape-2.png'


const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const ServiceSectionS2 = (props) => {
    return (
        <section className="service-section fix section-padding">
            <div className="shape-image-2">
                <img src={Sshape1} alt="img" />
            </div>
            <div className="shape-image-3">
                <img src={Sshape2} alt="img" />
            </div>
            <div className="container">
                <div className="section-title text-center">
                    <h6 className="wow fadeInUp">Digital printing Service</h6>
                    <h2 className="wow fadeInUp" >
                        Our Populer Print Service <br />
                        Complete Solution
                    </h2>
                </div>
                <div className="row">
                    {Services.slice(6, 9).map((service, sitem) => (
                        <div className="col-xl-4 col-lg-6 col-md-6 wow img-custom-anim-top" key={sitem}>
                            <div className="service-card-items-2">
                                <div className="service-content">
                                    <span>service {service.ItemS}</span>
                                    <h3><Link onClick={ClickHandler} to={`/service-single/${service.slug}`}>{service.title}</Link></h3>
                                    <p>
                                        {service.description}
                                    </p>
                                    <Link onClick={ClickHandler} to={`/service-single/${service.slug}`} className="link-btn">Discover Now <i className="fa-solid fa-arrow-right-long"></i></Link>
                                </div>
                                <div className="service-image">
                                    <img src={service.sImg} alt="img" />
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
}

// export default ServiceSectionS2;


export { ServiceSectionS2 as InkMeServiceSectionS2 };
