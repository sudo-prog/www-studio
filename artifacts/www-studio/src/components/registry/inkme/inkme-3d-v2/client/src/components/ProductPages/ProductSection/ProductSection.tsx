import * as React from 'react';
import ProdactShape from '../../../img/product/shape-1.png'
import { Link } from 'react-router-dom';
import { fetchDataFromApi, postData } from '../../../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMyContext } from '../../../context/MyContext';
import { trackAddToCart } from '../../../utils/analytics';

const ProductSection = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const { setCartData } = useMyContext();

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const openTab = (tabIndex) => {
        setActiveTab(tabIndex);

        // Fetch products for this category if not already loaded
        if (categories[tabIndex] && (!productsByCategory[tabIndex] || productsByCategory[tabIndex].length === 0)) {
            fetchProductsByCategory(categories[tabIndex]._id, tabIndex);
        }
    }

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchProductsByCategory = async (categoryId, categoryIndex) => {
        try {
            const response = await fetchDataFromApi(`/api/products?category=${categoryId}`);
            const products = response.products || [];

            setProductsByCategory(prev => ({
                ...prev,
                [categoryIndex]: products
            }));
        } catch (error) {
            console.error('Error fetching products for category:', error);
        }
    };

    const handleAddToCart = async (product) => {
        try {

            if (!user) {
                toast.error('Please log in to add to cart');
                return;
            }

            //Prepare data for cart item
            const cartData = {
                productTitle: product.name,
                images: product.images,
                rating: product.rating || "0",
                price: product.price,
                quantity: 1, //Default quantity
                subTotal: product.price, //Initial total amount
                productId: product._id,
                userId: user.userId,
                classifications: [{
                    name: "Default",
                    image: product.images[0],
                    price: product.price,
                    quantity: 1,
                    subTotal: product.price
                }]
            };

            const response = await postData('/api/cart/add', cartData);

            if (response.status === false) {
                toast.error(response.message || 'Unable to add to cart');
            } else {
                toast.success(`Product has been added to cart`);

                // Google Analytics tracking
                trackAddToCart({
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    category: 'Custom Print'
                });

                //Refetch cart and update context
                const updatedCart = await fetchDataFromApi(`/api/cart?userId=${user?.userId}`);
                setCartData(updatedCart);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('An error occurred while adding to cart');
        }
    };

    useEffect(() => {
        const fetchCategoriesAndProducts = async () => {
            try {
                //Fetch categories - get the first 5 categories
                const categoriesResponse = await fetchDataFromApi('/api/category?page=1');
                const categoriesList = categoriesResponse.categoryList || [];
                const limitedCategories = categoriesList.slice(0, 4); //Limit 5 categories

                setCategories(limitedCategories);

                // Initialize empty products for each category
                const initialProducts = {};
                limitedCategories.forEach((category, index) => {
                    initialProducts[index] = [];
                });
                setProductsByCategory(initialProducts);

                // Set first tab as active if categories exist
                if (limitedCategories.length > 0) {
                    setActiveTab(0);
                    // Fetch products for the first category
                    fetchProductsByCategory(limitedCategories[0]._id, 0);
                }

            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback to default categories if API fails
                const defaultCategories = [
                    { _id: '1', name: 'Business Cards', color: '#FF6B6B' },
                    { _id: '2', name: 'Books & Prints', color: '#4ECDC4' },
                    { _id: '3', name: 'Otaku Vibes (Anime)', color: '#45B7D1' },
                    { _id: '4', name: 'Invitation Card', color: '#96CEB4' }
                ];
                setCategories(defaultCategories);
                setActiveTab(0);
            }
        };

        fetchCategoriesAndProducts();
    }, []);

    const renderProductGrid = (products) => {
        return (
            <div className="row">
                {products.length > 0 &&
                    products.slice(0, 8).map((product, pitem) => (
                        <div className="col-xl-3 col-lg-4 col-md-6 col-6" key={pitem}>
                            <div className="product-box-items style-2">
                                <div className="product-image">
                                    <Link to={`/shop-details/${product._id}`}>
                                        <img src={product.images[0]} alt={product.name} />
                                    </Link>
                                    <div className="post-box">
                                        new
                                    </div>
                                    <ul className="product-icon d-grid align-items-center">
                                        {/* <div className="">
 <button
 OnClick={() => handleAddToCart(product)} className="">Add to cart
 </button>
 </div>               {/* <li>
                                            <a href="#">
                                                <i className="fa-regular fa-star"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <Link to={`/shop-details/${product._id}`}><i className="fa-regular fa-arrow-up-arrow-down"></i></Link>
                                        </li> */}
                                    </ul>
                                    {/* <div className="shop-btn">
                                        <button
                                            onClick={() => handleAddToCart(product)} className="theme-btn">Add to cart</button>
                                    </div> */}
                                </div>
                                <div className="product-content">
                                    <h6><Link to={`/shop-details/${product._id}`}>{product.name}</Link></h6>
                                    <div className="star">
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`fa-solid fa-star ${i === 4 ? 'color-2' : ''}`}></i>
                                        ))}
                                    </div>
                                    <ul className="price">
                                        <li>
                                            {product.oldPrice ? (
                                                <span>( {product.price.toLocaleString('vi-VN')}đ - <del>{product.oldPrice.toLocaleString('vi-VN')}đ</del> )</span>
                                            ) : (
                                                <span>{product.price.toLocaleString('vi-VN')}đ</span>
                                            )}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        );
    };

    return (
        <section className="product-section section-padding pt-0">
            <div className="shape-image">
                <img src={ProdactShape} alt="img" />
            </div>
            <div className="container">
                <div className="section-title text-center">
                    <h6>Digital printing Service</h6>
                    <h2>Explore Featured Products🔥</h2>
                </div>
                <div className="product-header mt-4 mt-md-0">
                    <ul className="nav">
                        {categories.map((category, index) => (
                            <li key={category._id} className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === index ? 'active' : ''}`}
                                    onClick={() => openTab(index)}
                                >
                                    {category.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="tab-content">
                    {categories.map((category, index) => (
                        <div key={category._id} style={{ display: activeTab === index ? 'block' : 'none' }}>
                            {renderProductGrid(productsByCategory[index] || [])}
                        </div>
                    ))}
                </div>
                <div className="shop-button text-center mt-5 " >
                    <Link to="/shop" className="theme-btn">View all products</Link>
                </div>
            </div>
        </section>
    );
};

// export default ProductSection;
export { ProductSection as InkMeProductSection };
