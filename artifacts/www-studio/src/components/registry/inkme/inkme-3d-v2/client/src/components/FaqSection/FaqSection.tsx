import React from 'react';

import FaqBg from '../../img/faq-bg.jpg'
import AccordionSection from './AccordionSection';

const FaqSection = () => {
    return (
        <section className="faq-section fix section-padding bg-cover"  style={{ backgroundImage: `url(${FaqBg})` }}>
            <div className="container">
                <div className="section-title text-center">
                    <h6 className="wow fadeInUp">Digital printing Service</h6>
                    <h2 className="wow fadeInUp" data-wow-delay=".3s">Freequently Ask Questions</h2>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="faq-wrapper">
                            <div className="faq-content">
                                <div className="faq-accordion">
                                    <AccordionSection />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default FaqSection;
export { FaqSection as InkMeFaqSection };
