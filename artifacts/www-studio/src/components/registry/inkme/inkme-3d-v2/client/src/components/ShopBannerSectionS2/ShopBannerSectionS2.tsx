import React from 'react';
import { Link } from 'react-router-dom';

import SB1 from '../../img/shop-banner/t-shirt.png'
import SB2 from '../../img/shop-banner/flower.png'
import SB3 from '../../img/icon/16.svg'
import SB4 from '../../img/shop-banner/gift-box.png'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const ShopBannerSectionS2 = () => {
    return (
        <section className="shop-banner-section-2 fix">
            <div className="row g-4">
                <div className="col-xl-6 wow img-custom-anim-top" data-wow-duration="1.5s" data-wow-delay="0.1s">
                    <div className="shop-banner-items-2">
                        <div className="content">
                            <p className="wow fadeInUp">Wear your brand with pride</p>
                            <h2 className="wow fadeInUp" data-wow-delay=".3s">Hoddie custom print</h2>
                            <h3 className="wow fadeInUp" data-wow-delay=".5s"><span>Starting</span> 560.99</h3>
                            <Link onClick={ClickHandler} to="/shop" className="theme-btn wow fadeInUp" data-wow-delay=".7s">Custom print now</Link>
                        </div>
                        <div className="thumb wow fadeInUp" data-wow-delay=".3s">
                            <img src={SB1} alt="img" />
                            <div className="flower-shape">
                                <img src={SB2} alt="img" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-6 wow img-custom-anim-top" data-wow-duration="1.5s" data-wow-delay="0.2s">
                    <div className="shop-banner-items-2 style-2">
                        <div className="content">
                            <p className="wow fadeInUp">Wear your brand with pride</p>
                            <h2 className="wow fadeInUp" data-wow-delay=".3s">Custom Packaging</h2>
                            <ul className="wow fadeInUp" data-wow-delay=".5s">
                                <li>
                                    <span><img src={SB3} /></span>
                                    Premium Quality Custom boxes
                                </li>
                                <li>
                                    <span><img src={SB3} /></span>
                                    Free Standard Shipping
                                </li>
                                <li>
                                    <span><img src={SB3} /></span>
                                    Unnique Design & custom cloths
                                </li>
                            </ul>
                        </div>
                        <div className="thumb-2">
                            <Link onClick={ClickHandler} to="/shop">
                                <img src={SB4} alt="img" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default ShopBannerSectionS2;
export { ShopBannerSectionS2 as InkMeShopBannerSectionS2 };
