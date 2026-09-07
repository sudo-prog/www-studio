import React from 'react';

import BG1 from '../../../img/brand/bg.jpg'
import Logo1 from '../../../img/brand/brand-logo-11.png'
import Logo2 from '../../../img/brand/brand-logo-12.png'
import Logo3 from '../../../img/brand/brand-logo-13.png'
import Logo4 from '../../../img/brand/brand-logo-14.png'
import Logo5 from '../../../img/brand/brand-logo-15.png'
import VideoModal from '../../ModalVideo/VideoModal';



const CtaVideoSection = () => {
    return (
        <div className="cta-video-section">
            <div className="mycustom-marque style-about">
                <div className="scrolling-wrap">
                    <div className="comm">
                        <div className="cmn-textslide">business </div>
                        <div className="cmn-textslide">Consulting</div>
                    </div>
                    <div className="comm">
                        <div className="cmn-textslide">business </div>
                        <div className="cmn-textslide">Consulting</div>
                    </div>
                    <div className="comm">
                        <div className="cmn-textslide">business </div>
                        <div className="cmn-textslide">Consulting</div>
                    </div>
                    <div className="comm">
                        <div className="cmn-textslide">business </div>
                        <div className="cmn-textslide">Consulting</div>
                    </div>
                    <div className="comm">
                        <div className="cmn-textslide">business </div>
                        <div className="cmn-textslide">Consulting</div>
                    </div>
                </div>
            </div>
            <div className="container-fluid">
                <div className="cta-video-wrapper bg-cover" style={{ backgroundImage: `url("https://prinoz-react.wpocean.com/static/media/cta-video.b253db58685dddc0a7c1.jpg")` }}>
                    <div >
                        <VideoModal />
                    </div>
                </div>
            </div>
            <div className="brand-wrapper-4 bg-cover" style={{ backgroundImage: `url(${BG1})` }}>
                <div className="container">
                    <h4 className="text-center">We are served by the<span>big brands</span></h4>
                    <div className="brand-items">
                        <div className="brand-logo">
                            <img src={Logo1} alt="img" />
                        </div>
                        <div className="brand-logo">
                            <img src={Logo2} alt="img" />
                        </div>
                        <div className="brand-logo">
                            <img src={Logo3} alt="img" />
                        </div>
                        <div className="brand-logo">
                            <img src={Logo4} alt="img" />
                        </div>
                        <div className="brand-logo">
                            <img src={Logo5} alt="img" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

// export default CtaVideoSection;
export { CtaVideoSection as InkMeCtaVideoSection };
