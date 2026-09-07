import * as React from 'react';
import PS1 from '../../img/pricing-shape.png'
import PS2 from '../../img/pricing-line.png'
import PS3 from '../../img/circle.png'
import PS4 from '../../img/icon/03.svg'
import PS5 from '../../img/pricing-tag.png'
import { Link } from 'react-router-dom';

const PricingSection = () => {
    const [activeTab, setActiveTab] = useState('Tab1');
    const openTab = (tabName) => {
        setActiveTab(tabName);
    };
    useEffect(() => {
        openTab('Tab1');
    }, []); 

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    };


    return (
        <section className="pricing-section section-padding pt-0">
            <div className="shape-image float-bob-y">
                <img src={PS1} alt="img" />
            </div>
            <div className="shape-image-2">
                <img src={PS2} alt="img" />
            </div>
            <div className="circle-shape">
                <img src={PS3} alt="img" />
            </div>
            <div className="container">
                <div className="section-title text-center">
                    <h6>Digital printing Service</h6>
                    <h2>
                        Our Populer Pricing Plan<br />
                        By Company
                    </h2>
                </div>
                <div className="pricing-tab-header">
                    <ul className="nav">
                        <li className="nav-item"  >
                            <button className={`nav-link ${activeTab === 'Tab1' ? 'active' : ''}`} onClick={() => openTab('Tab1')} >
                                Monthly
                            </button>
                        </li>
                        <li className="nav-item"  >
                            <button className={`nav-link ${activeTab === 'Tab2' ? 'active' : ''}`} onClick={() => openTab('Tab2')}>
                                Yearly
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="tab-content">
                    <div id="Tab1" style={{ display: activeTab === 'Tab1' ? 'block' : 'none' }}>
                        <div className="row">
                            <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                                <div className="pricing-box-items">
                                    <div className="pricing-header">
                                        <div className="icon">
                                            <img src={PS4} alt="img" />
                                        </div>
                                        <h3>Normal Plan</h3>
                                        <span>Customized anything in anytime</span>
                                    </div>
                                    <ul className="pricing-list">
                                        <li><i className="fa-solid fa-circle-check"></i> 3-5 days turnaround</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Native Development</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Task delivered one-by one</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Dedicated dashboard</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Updates via dashboard & slack</li>
                                        <li><i className="fa-solid fa-circle-check"></i> 50k design & prints</li>
                                    </ul>
                                    <div className="pricing-btn">
                                        <Link onClick={ClickHandler} to="/contact" className="theme-btn">
                                            <span className="theme-effect">
                                                <span className="effect-1">choose pricing plan</span>
                                                <span className="effect-1">$2500/ Month</span>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                                <div className="pricing-box-items active">
                                    <div className="pricing-tag">
                                        <img src={PS5} alt="img" />
                                    </div>
                                    <div className="pricing-header">
                                        <div className="icon">
                                            <img src={PS4} alt="img" />
                                        </div>
                                        <h3>Personal Plan</h3>
                                        <span>Customized anything in anytime</span>
                                    </div>
                                    <ul className="pricing-list">
                                        <li><i className="fa-solid fa-circle-check"></i> 3-5 days turnaround</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Native Development</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Task delivered one-by one</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Dedicated dashboard</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Updates via dashboard & slack</li>
                                        <li><i className="fa-solid fa-circle-check"></i> 50k design & prints</li>
                                    </ul>
                                    <div className="pricing-btn">
                                        <Link onClick={ClickHandler} to="/contact" className="theme-btn">
                                            <span className="theme-effect">
                                                <span className="effect-1">choose pricing plan</span>
                                                <span className="effect-1">$2500/ Month</span>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                                <div className="pricing-box-items">
                                    <div className="pricing-header">
                                        <div className="icon">
                                            <img src={PS4} alt="img" />
                                        </div>
                                        <h3>Premium Plan</h3>
                                        <span>Customized anything in anytime</span>
                                    </div>
                                    <ul className="pricing-list">
                                        <li><i className="fa-solid fa-circle-check"></i> 3-5 days turnaround</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Native Development</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Task delivered one-by one</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Dedicated dashboard</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Updates via dashboard & slack</li>
                                        <li><i className="fa-solid fa-circle-check"></i> 50k design & prints</li>
                                    </ul>
                                    <div className="pricing-btn">
                                        <Link onClick={ClickHandler} to="/contact" className="theme-btn">
                                            <span className="theme-effect">
                                                <span className="effect-1">choose pricing plan</span>
                                                <span className="effect-1">$2500/ Month</span>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="Tab2" style={{ display: activeTab === 'Tab2' ? 'block' : 'none' }}>
                        <div className="row">
                            <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                                <div className="pricing-box-items">
                                    <div className="pricing-header">
                                        <div className="icon">
                                            <img src={PS4} alt="img" />
                                        </div>
                                        <h3>Personal Plan</h3>
                                        <span>Customized anything in anytime</span>
                                    </div>
                                    <ul className="pricing-list">
                                        <li><i className="fa-solid fa-circle-check"></i> 3-5 days turnaround</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Native Development</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Task delivered one-by one</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Dedicated dashboard</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Updates via dashboard & slack</li>
                                        <li><i className="fa-solid fa-circle-check"></i> 50k design & prints</li>
                                    </ul>
                                    <div className="pricing-btn">
                                        <Link onClick={ClickHandler} to="/contact" className="theme-btn">
                                            <span className="theme-effect">
                                                <span className="effect-1">choose pricing plan</span>
                                                <span className="effect-1">$2500/ Month</span>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".5s">
                                <div className="pricing-box-items active">
                                    <div className="pricing-tag">
                                        <img src={PS5} alt="img" />
                                    </div>
                                    <div className="pricing-header">
                                        <div className="icon">
                                            <img src={PS4} alt="img" />
                                        </div>
                                        <h3>Personal Plan</h3>
                                        <span>Customized anything in anytime</span>
                                    </div>
                                    <ul className="pricing-list">
                                        <li><i className="fa-solid fa-circle-check"></i> 3-5 days turnaround</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Native Development</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Task delivered one-by one</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Dedicated dashboard</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Updates via dashboard & slack</li>
                                        <li><i className="fa-solid fa-circle-check"></i> 50k design & prints</li>
                                    </ul>
                                    <div className="pricing-btn">
                                        <Link onClick={ClickHandler} to="/contact" className="theme-btn">
                                            <span className="theme-effect">
                                                <span className="effect-1">choose pricing plan</span>
                                                <span className="effect-1">$2500/ Month</span>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                                <div className="pricing-box-items">
                                    <div className="pricing-header">
                                        <div className="icon">
                                            <img src={PS4} alt="img" />
                                        </div>
                                        <h3>Personal Plan</h3>
                                        <span>Customized anything in anytime</span>
                                    </div>
                                    <ul className="pricing-list">
                                        <li><i className="fa-solid fa-circle-check"></i> 3-5 days turnaround</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Native Development</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Task delivered one-by one</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Dedicated dashboard</li>
                                        <li><i className="fa-solid fa-circle-check"></i> Updates via dashboard & slack</li>
                                        <li><i className="fa-solid fa-circle-check"></i> 50k design & prints</li>
                                    </ul>
                                    <div className="pricing-btn">
                                        <Link onClick={ClickHandler} to="/contact" className="theme-btn">
                                            <span className="theme-effect">
                                                <span className="effect-1">choose pricing plan</span>
                                                <span className="effect-1">$2500/ Month</span>
                                            </span>
                                        </Link>
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

// export default PricingSection;
export { PricingSection as InkMePricingSection };
