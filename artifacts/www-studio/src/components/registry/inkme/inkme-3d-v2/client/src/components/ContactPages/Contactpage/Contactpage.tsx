import React from 'react';
import InfIcon1 from '../../../img/icon/location.png'
import InfIcon2 from '../../../img/icon/12.svg'
import InfIcon3 from '../../../img/icon/13.svg'
import ContactForm from '../ContactFrom/ContactForm';
// import ContactForm from '../ContactFrom/ContactForm'


const Contactpage = () => {

    return (
        <div>
            <section className="contact-info-section fix section-padding section-bg-2">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                            <div className="contact-info-items text-center">
                                <div className="icon">
                                    <img src={InfIcon1} alt="icon-img" />
                                </div>
                                <div className="content">
                                    <h3>Address</h3>
                                    <p>Hoa Lac - Thach That - Hanoi</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                            <div className="contact-info-items active text-center">
                                <div className="icon">
                                    <img src={InfIcon2} alt="icon-img" />
                                </div>
                                <div className="content">
                                    <h3>Phone number</h3>
                                    <p>
                                        +84 968 3388 29
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                            <div className="contact-info-items text-center">
                                <div className="icon">
                                    <img src={InfIcon3} alt="icon-img" />
                                </div>
                                <div className="content">
                                    <h3>Email</h3>
                                    <p>
                                        datlacve2@gmail.com
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="contact-section section-padding pt-0 section-bg-2">
                <div className="container">
                    <div className="contact-area">
                        <div className="row justify-content-between">
                            <div className="col-xl-6 col-lg-6">
                                <div className="map-content-area">
                                    <h3 className="wow fadeInUp" data-wow-delay=".3s">Contact us</h3>
                                    <p className="wow fadeInUp" data-wow-delay=".5s">For more information about our services, please contact us.</p>
                                    <div className="google-map">
                                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14898.821789147121!2d105.51226975!3d21.0044412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abc60e7d3f19%3A0x2be9d7d0b5abcbf4!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1749682803764!5m2!1svi!2s" width="600" height="450" style={{ border: '0' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-5 col-lg-5 mt-5 mt-lg-0">
                                <div className="contact-form-items">
                                    <div className="contact-title">
                                        <h3 className="wow fadeInUp" data-wow-delay=".3s">Fill out the form</h3>
                                        <p className="wow fadeInUp" data-wow-delay=".5s">Your email address will not be published. Required fields are marked *</p>
                                    </div>

                                    <ContactForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )

}

// export default Contactpage;
export { Contactpage as InkMeContactpage };
