import React from 'react';

import Ct1 from '../../../img/cta-img.png';
import Ct2 from '../../../img/hand-bag.png';
import Ct3 from '../../../img/t-shirt.png';
import Ct4 from '../../../img/print-box.png';
import CtBg from '../../../img/cta-bg.jpg';
import { Link } from 'react-router-dom';

const CtaSection = () => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }
    return (
        <section className="cta-section" style={{ padding: '150px 0px 0px 0px' }}>
            <div className="container">
                <div className="cta-wrapper bg-cover" style={{backgroundImage: `url(${CtBg})`} }>
                    <div className="cta-image">
                        <img src={Ct1} alt="img" />
                    </div>
                    <div className="hand-bag float-bob-x">
                        <img src={Ct2} alt="img" />
                    </div>
                    <div className="t-shirt-shape float-bob-x">
                        <img src={Ct3} alt="img" />
                    </div>
                    <div className="prite-box float-bob-y">
                        <img src={Ct4} alt="img" />
                    </div>
                    <div className="section-title">
                        <h6 className="wow fadeInUp">Printing services</h6>
                        <h2 className="wow fadeInUp" data-wow-delay=".3s">Ready to create<br />Unique products?</h2>
                    </div>
                    <Link onClick={ClickHandler} to="/about" className="theme-btn mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">more about us</Link>
                </div>
            </div>
        </section>
    );
};

// export default CtaSection;
export { CtaSection as InkMeCtaSection };
