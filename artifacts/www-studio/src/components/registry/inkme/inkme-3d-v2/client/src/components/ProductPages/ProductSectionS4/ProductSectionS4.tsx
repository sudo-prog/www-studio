import * as React from 'react';
import ProdactShape from '../../../img/feature-product/stickers.png'
import { Link } from 'react-router-dom';



const ProductSectionS4 = ({ products, addToCartProduct }) => {

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const [activeTab, setActiveTab] = useState('Tab2');
    const openTab = (TabName) => {
        setActiveTab(TabName);
    }
    useEffect(() => {
        openTab('Tab2');
    }, []);

    return (

        <section className="feature-product-section-3 fix section-padding">
            <div className="right-shape">
                <img src={ProdactShape} alt="img" />
            </div>
            <div className="container">
                <div className="section-title-area">
                    <div className="section-title">
                        <h6 className="bg-4">Digital printing Service</h6>
                        <h2>Featured Products</h2>
                    </div>
                    <div className="product-header style-2">
                        <ul className="nav">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'Tab1' ? 'active' : ''}`} onClick={() => openTab('Tab1')}>
                                    Best Seller
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'Tab2' ? 'active' : ''}`} onClick={() => openTab('Tab2')}>
                                    Top
                                </button>
                            </li>
                            <li className="nav-item" >
                                <button className={`nav-link ${activeTab === 'Tab3' ? 'active' : ''}`} onClick={() => openTab('Tab3')}>
                                    New Arrivals
                                </button>
                            </li>
                            <li className="nav-item" >
                                <button className={`nav-link ${activeTab === 'Tab4' ? 'active' : ''}`} onClick={() => openTab('Tab4')}>
                                    top rating
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="tab-content">
                    <div id="Tab1" style={{ display: activeTab === 'Tab1' ? 'block' : 'none' }}>
                        <div className="row">
                            {products.length > 0 &&
                                products.slice(0, 4).map((product, pitem) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={pitem}>
                                        <div className="feature-product-items-2">
                                            <div className="product-image">
                                                <img src={product.proImg} alt="img" />
                                                <ul className="product-icon d-grid align-items-center">
                                                    <li>
                                                        <button onClick={() => addToCartProduct(product)}>
                                                            <i className="fa-sharp fa-regular fa-eye"></i>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <i className="fa-regular fa-star"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                            <i className="fa-regular fa-arrow-up-arrow-down"></i>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="product-content">
                                                <ul className="price-list">
                                                    <li>
                                                        <span>-5%</span>
                                                    </li>
                                                    <li>{product.price}</li>
                                                    <li>{product.price}</li>
                                                </ul>
                                                <h4><Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>{product.title}</Link></h4>
                                                <ul className="dot-list">
                                                    <li></li>
                                                    <li></li>
                                                    <li></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                ))}
                        </div>
                    </div>
                    <div id="Tab2" style={{ display: activeTab === 'Tab2' ? 'block' : 'none' }}>
                        <div className="row">
                            {products.length > 0 &&
                                products.slice(4, 8).map((product, pitem) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={pitem}>
                                        <div className="feature-product-items-2">
                                            <div className="product-image">
                                                <img src={product.proImg} alt="img" />
                                                <ul className="product-icon d-grid align-items-center">
                                                    <li>
                                                        <button onClick={() => addToCartProduct(product)}>
                                                            <i className="fa-sharp fa-regular fa-eye"></i>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <i className="fa-regular fa-star"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                            <i className="fa-regular fa-arrow-up-arrow-down"></i>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="product-content">
                                                <ul className="price-list">
                                                    <li>
                                                        <span>-5%</span>
                                                    </li>
                                                    <li>{product.price}</li>
                                                    <li>{product.price}</li>
                                                </ul>
                                                <h4><Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>{product.title}</Link></h4>
                                                <ul className="dot-list">
                                                    <li></li>
                                                    <li></li>
                                                    <li></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                ))}
                        </div>
                    </div>
                    <div id="Tab3" style={{ display: activeTab === 'Tab3' ? 'block' : 'none' }}>
                        <div className="row">
                            {products.length > 0 &&
                                products.slice(0, 4).map((product, pitem) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={pitem}>
                                        <div className="feature-product-items-2">
                                            <div className="product-image">
                                                <img src={product.proImg} alt="img" />
                                                <ul className="product-icon d-grid align-items-center">
                                                    <li>
                                                        <button onClick={() => addToCartProduct(product)}>
                                                            <i className="fa-sharp fa-regular fa-eye"></i>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <i className="fa-regular fa-star"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                            <i className="fa-regular fa-arrow-up-arrow-down"></i>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="product-content">
                                                <ul className="price-list">
                                                    <li>
                                                        <span>-5%</span>
                                                    </li>
                                                    <li>{product.price}</li>
                                                    <li>{product.price}</li>
                                                </ul>
                                                <h4><Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>{product.title}</Link></h4>
                                                <ul className="dot-list">
                                                    <li></li>
                                                    <li></li>
                                                    <li></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                ))}
                        </div>
                    </div>
                    <div id="Tab4" style={{ display: activeTab === 'Tab4' ? 'block' : 'none' }}>
                        <div className="row">
                            {products.length > 0 &&
                                products.slice(4, 8).map((product, pitem) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={pitem}>
                                        <div className="feature-product-items-2">
                                            <div className="product-image">
                                                <img src={product.proImg} alt="img" />
                                                <ul className="product-icon d-grid align-items-center">
                                                    <li>
                                                        <button onClick={() => addToCartProduct(product)}>
                                                            <i className="fa-sharp fa-regular fa-eye"></i>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <i className="fa-regular fa-star"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                            <i className="fa-regular fa-arrow-up-arrow-down"></i>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="product-content">
                                                <ul className="price-list">
                                                    <li>
                                                        <span>-5%</span>
                                                    </li>
                                                    <li>{product.price}</li>
                                                    <li>{product.price}</li>
                                                </ul>
                                                <h4><Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>{product.title}</Link></h4>
                                                <ul className="dot-list">
                                                    <li></li>
                                                    <li></li>
                                                    <li></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default ProductSectionS4;






export { ProductSectionS4 as InkMeProductSectionS4 };
