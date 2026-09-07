import React from 'react';

/* image  */
import Abimg1 from '../../../img/about/dot-1.png'
import Abimg2 from '../../../img/about/dot-2.png'
import Abimg3 from '../../../img/about/circle.png'
import Abimg4 from '../../../img/about/cap.png'
import Abimg5 from '../../../img/about/shape.png'
import Abimg6 from '../../../img/about/01.jpg'
import Abimg7 from '../../../img/about/02.jpg'
import Abimg8 from '../../../img/about/03.jpg'
import Abimg9 from '../../../img/line.png'
import Abimg10 from '../../../img/icon/01.svg'
import Abimg11 from '../../../img/about/author.png'
import Abimg12 from '../../../img/about/line.png'
import Abimg13 from '../../../img/icon/02.svg'
import { Link, useNavigate } from 'react-router-dom';
import video from '../../../img/about/demo custom.mp4'
import Custom3D from '../../../main-component/Custom3D/Custom3D'
import { useMyContext } from '../../../context/MyContext';
import { trackCTAClick } from '../../../utils/analytics';

const About = () => {
    const [showPopup, setShowPopup] = React.useState(false);
    const { userId, setAlterBox } = useMyContext();
    const navigate = useNavigate();

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const handleCustom3D = (e) => {
        e.preventDefault();

        // Google Analytics tracking - CTA Click
        trackCTAClick('Experience it now', 'About Section');

        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user || !userId) {
            setAlterBox({
                open: true,
                error: true,
                message: "You need to log in to use the 3D design feature"
            });

            setTimeout(() => {
                navigate('/login');
            }, 1500);

            return;
        }

        setShowPopup(true);
    }

    const closePopup = () => setShowPopup(false);
    return (
        <section className="about-section section-padding pt-0" style={{ marginTop: '60px' }}>
            <div className="dot-shape">
                <img src={Abimg1} alt="img" />
            </div>
            <div className="dot-shape-2">
                <img src={Abimg2} alt="img" />
            </div>
            <div className="container">
                <div className="about-wrapper">
                    <div className="row g-4">
                        <div className="col-lg-7 d-flex align-items-center">
                            <div className="about-image-items w-100">
                                <div className="about-video wow fadeInUp">
                                    <video
                                        className="w-100"
                                        // controls
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    >
                                        <source src={video} type="video/mp4" />
                                    </video>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="about-content">
                                <div className="section-title">
                                    <h6 className="wow fadeInUp">About us</h6>
                                    <h2 className="wow fadeInUp" data-wow-delay=".3s">Turn your ideas<span>Become a reality<img src={Abimg9} alt="img" /></span>
                                    </h2>
                                </div>
                                <p className="mt-3 mt-md-0 wow fadeInUp" data-wow-delay=".5s">
                                    Dù bạn muốn tạo áo cho chính mình hay mở rộng thương hiệu thời trang online –
                                    InkMe cung cấp kho mẫu thiết kế đẹp mắt, dễ tùy chỉnh và sẵn sàng in ấn.
                                </p>
                                <video
                                    className="w-100 video-2 d-block d-md-none"
                                    // controls
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                >
                                    <source src={video} type="video/mp4" />
                                </video>
                                <div className="row g-4 d-none d-md-flex">
                                    <div className="col-xl-6 col-md-6 col-lg-12 wow fadeInUp" data-wow-delay=".3s">
                                        <div className="icon-box-items active">
                                            <div className="icon-items">
                                                <div className="icon">
                                                    <img src={Abimg10} alt="img" />
                                                </div>
                                                <h6>Process Automation</h6>
                                            </div>
                                            <span>From design to ordering – every step is optimized</span>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-md-6 col-lg-12 wow fadeInUp" data-wow-delay=".5s">
                                        <div className="icon-box-items">
                                            <div className="icon-items">
                                                <div className="icon bg-2">
                                                    <img src={Abimg13} alt="" />
                                                </div>
                                                <h6>Brand Building Tools</h6>
                                            </div>
                                            <span>Easily add logos, slogans, or personalize every detail on the shirt</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="about-author">
                                    <button onClick={handleCustom3D} className="theme-btn wow fadeInUp" data-wow-delay=".3s">Trải nghiệm ngay</button>
                                    {showPopup && (
                                        <div className='custom-3d-popup' >
                                            <div className='custom-3d-popup-content'>
                                                <button onClick={closePopup} className='custom-3d-popup-close'>×</button>
                                                <Custom3D />
                                            </div>
                                        </div>
                                    )}
                                    <div className="author-image wow fadeInUp" data-wow-delay=".5s">
                                        <img src={Abimg11} alt="img" />
                                        <div className="content">
                                            <span>Professional staff team<img src={Abimg12} alt="img" /></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default About;
export { About as InkMeAbout };
