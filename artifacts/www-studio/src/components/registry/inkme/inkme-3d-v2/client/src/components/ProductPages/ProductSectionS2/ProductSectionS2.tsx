import * as React from 'react';
import { Link } from 'react-router-dom';

const ProductSectionS2 = ({ products, addToCartProduct }) => {

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
        <section className="product-section section-padding pt-0">
           
            <div className="container">
                <div className="section-title text-center">
                    <h6>Digital printing Service</h6>
                    <h2>Explore Features Product</h2>
                </div>
                <div className="product-header mt-4 mt-md-0">
                    <ul className="nav">
                        <li className="nav-item" >
                            <button className={`nav-link ${activeTab === 'Tab1' ? 'active' : ''}`} onClick={() => openTab('Tab1')}>
                                Business Cards
                            </button>
                        </li>
                        <li className="nav-item" >
                            <button className={`nav-link ${activeTab === 'Tab2' ? 'active' : ''}`} onClick={() => openTab('Tab2')}>
                                Books & Prints
                            </button>
                        </li>
                        <li className="nav-item" >
                            <button className={`nav-link ${activeTab === 'Tab3' ? 'active' : ''}`} onClick={() => openTab('Tab3')}>
                                T-shirt & Cloths
                            </button>
                        </li>
                        <li className="nav-item" >
                            <button className={`nav-link ${activeTab === 'Tab4' ? 'active' : ''}`} onClick={() => openTab('Tab4')}>
                                Invitation Card
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="tab-content">
                    <div id="Tab1" style={{ display: activeTab === 'Tab1' ? 'block' : 'none' }} >
                        <div className="row">
                            {products.length > 0 &&
                                products.slice(8, 12).map((product, pitem) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={pitem}>
                                        <div className="product-box-items style-2">
                                            <div className="product-image">
                                                <img src={product.proImg} alt="img" />
                                                <div className="post-box">
                                                    new
                                                </div>
                                                <ul className="product-icon d-flex align-items-center justify-content-center">
                                                    <li>
                                                        <button
                                                            onClick={() => addToCartProduct(product)}><i className="fa-light fa-basket-shopping"></i></button>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                            <i className="fa-regular fa-arrows-maximize"></i>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}><i className="fa-sharp fa-regular fa-heart"></i></Link>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="product-content">
                                                <h6><Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>{product.title}</Link></h6>
                                                <div className="star">
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="color-2 fa-solid fa-star"></i>
                                                </div>
                                                <ul className="price">
                                                    <li>
                                                        ( ${product.price} - <del>${product.delPrice}</del> )
                                                    </li>
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
                                products.slice(8, 12).map((product, pitem) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={pitem}>
                                        <div className="product-box-items style-2">
                                            <div className="product-image">
                                                <img src={product.proImg} alt="img" />
                                                <div className="post-box">
                                                    new
                                                </div>
                                                <ul className="product-icon d-flex align-items-center justify-content-center">
                                                    <li>
                                                        <button
                                                            onClick={() => addToCartProduct(product)}><i className="fa-light fa-basket-shopping"></i></button>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                            <i className="fa-regular fa-arrows-maximize"></i>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}><i className="fa-sharp fa-regular fa-heart"></i></Link>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="product-content">
                                                <h6><Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>{product.title}</Link></h6>
                                                <div className="star">
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="color-2 fa-solid fa-star"></i>
                                                </div>
                                                <ul className="price">
                                                    <li>
                                                        ( ${product.price} - <del>${product.delPrice}</del> )
                                                    </li>
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
                                products.slice(8, 12).map((product, pitem) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={pitem}>
                                        <div className="product-box-items style-2">
                                            <div className="product-image">
                                                <img src={product.proImg} alt="img" />
                                                <div className="post-box">
                                                    new
                                                </div>
                                                <ul className="product-icon d-flex align-items-center justify-content-center">
                                                    <li>
                                                        <button
                                                            onClick={() => addToCartProduct(product)}><i className="fa-light fa-basket-shopping"></i></button>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                            <i className="fa-regular fa-arrows-maximize"></i>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}><i className="fa-sharp fa-regular fa-heart"></i></Link>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="product-content">
                                                <h6><Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>{product.title}</Link></h6>
                                                <div className="star">
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="color-2 fa-solid fa-star"></i>
                                                </div>
                                                <ul className="price">
                                                    <li>
                                                        ( ${product.price} - <del>${product.delPrice}</del> )
                                                    </li>
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
                                products.slice(8, 12).map((product, pitem) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={pitem}>
                                        <div className="product-box-items style-2">
                                            <div className="product-image">
                                                <img src={product.proImg} alt="img" />
                                                <div className="post-box">
                                                    new
                                                </div>
                                                <ul className="product-icon d-flex align-items-center justify-content-center">
                                                    <li>
                                                        <button
                                                            onClick={() => addToCartProduct(product)}><i className="fa-light fa-basket-shopping"></i></button>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                            <i className="fa-regular fa-arrows-maximize"></i>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}><i className="fa-sharp fa-regular fa-heart"></i></Link>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="product-content">
                                                <h6><Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>{product.title}</Link></h6>
                                                <div className="star">
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="color-2 fa-solid fa-star"></i>
                                                </div>
                                                <ul className="price">
                                                    <li>
                                                        ( ${product.price} - <del>${product.delPrice}</del> )
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                        </div>
                    </div>
                </div>
                <div className="shop-button text-center mt-5 " >
                    <Link onClick={ClickHandler} to="/shop" className="theme-btn">View all Product</Link>
                </div>
            </div>
        </section>
    );
};

// export default ProductSectionS2;
export { ProductSectionS2 as InkMeProductSectionS2 };
