import React from 'react';

import Sb1 from '../../img/shop-banner/01.png'
import Sb2 from '../../img/shop-banner/02.png'
import Shape from '../../img/shop-banner/vector.png'
import { Link } from 'react-router-dom';

const ShopbannerSection = () => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }
    
    return (
        <section className="shop-banner-section fix section-padding">
            <div className="container">
                <div className="row g-4 justify-content-center">
                    <div className="col-xxl-6 col-xl-7 col-lg-9 wow img-custom-anim-top">
                        <div className="shop-banner-items">
                            <div className="shop-banner-content">
                                <p>ECO-FRIENDLY PACKAGING</p>
                                <h3>
                                    Shop This Season <br />
                                    Favorites
                                </h3>
                                <h4><span>Starting </span>560.99</h4>
                                <Link onClick={ClickHandler} to="/shop" className="theme-btn">Shop Now</Link>
                            </div>
                            <div className="shop-image">
                                <img src={Sb1} alt="img" className="ps-2" />
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-6 col-xl-7 col-lg-9 wow img-custom-anim-top" >
                        <div className="shop-banner-items style-2">
                            <div className="shop-banner-content">
                                <p>ECO-FRIENDLY PACKAGING</p>
                                <h3>
                                    Customize Box <br />
                                    Mockup
                                </h3>
                                <h4><span>Starting </span>560.99</h4>
                                <Link onClick={ClickHandler} to="/shop" className="theme-btn">Shop Now</Link>
                            </div>
                            <div className="shop-image">
                                <img src={Sb2} alt="img" className="ps-2" />
                                <div className="sale-text">
                                    <img src={Shape} alt="img" />
                                    <h5>
                                        sale <br />
                                        30% off
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default ShopbannerSection;
export { ShopbannerSection as InkMeShopbannerSection };
