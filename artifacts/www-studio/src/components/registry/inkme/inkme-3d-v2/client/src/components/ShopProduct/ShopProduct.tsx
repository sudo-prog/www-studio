import * as React from 'react';
import { Link } from "react-router-dom";
import ShopSidebar from "./ShopSidebar";
import { trackViewProduct } from "../../utils/analytics";

const ShopProduct = ({ products, addToCartProduct, searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory }) => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    };

    const handleProductClick = (product) => {
        // Google Analytics tracking - Product Click
        trackViewProduct({
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category?.name || 'Custom Print'
        });
    };

    const [sortOption, setSortOption] = useState('1');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // New filter states
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(Infinity);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

    const resultsPerPage = 12;
    const totalResultsRef = useRef(0);

    useEffect(() => {
        if (products && products.products) {
            totalResultsRef.current = products.products.length;
            setLoading(false);
        }
    }, [products]);

    const totalPages = Math.ceil(totalResultsRef.current / resultsPerPage);

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        // Apply sorting logic based on selected option
        setCurrentPage(1); // Reset to first page when sorting
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Reset current page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, minPrice, maxPrice, selectedSizes, selectedColors]);

    const startIndex = (currentPage - 1) * resultsPerPage;

    // Enhanced filtering logic
    const filteredProducts = products && products.products ? products.products.filter(product => {
        // Search filter
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Category filter
        if (selectedCategory && product.category._id !== selectedCategory) {
            return false;
        }

        // Price filter
        const productPrice = parseFloat(product.price);
        if (productPrice < minPrice || productPrice > maxPrice) {
            return false;
        }

        // Size filter
        if (selectedSizes.length > 0 && product.sizes) {
            const hasMatchingSize = selectedSizes.some(size =>
                product.sizes.includes(size)
            );
            if (!hasMatchingSize) {
                return false;
            }
        }

        // Color filter
        if (selectedColors.length > 0 && product.colors) {
            const hasMatchingColor = selectedColors.some(color =>
                product.colors.includes(color)
            );
            if (!hasMatchingColor) {
                return false;
            }
        }

        return true;
    }) : [];

    // Sort filtered products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortOption) {
            case '1': // Default
                return 0;
            case '2': // Price: Low to High
                return parseFloat(a.price) - parseFloat(b.price);
            case '3': // Price: High to Low
                return parseFloat(b.price) - parseFloat(a.price);
            case '4': // Name: A to Z
                return a.name.localeCompare(b.name);
            case '5': // Name: Z to A
                return b.name.localeCompare(a.name);
            case '6': // Newest First
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    const currentProducts = sortedProducts.slice(startIndex, startIndex + resultsPerPage);

    // Update total results for pagination
    const totalFilteredResults = sortedProducts.length;
    const totalFilteredPages = Math.ceil(totalFilteredResults / resultsPerPage);

    const [activeTab, setActiveTab] = useState('Tab1');
    const openTab = (TabName) => {
        setActiveTab(TabName);
    };

    useEffect(() => {
        openTab('Tab1');
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <section className="shop-page-section fix section-padding section-bg-2">
            <div className="container">
                <div className="row g-4">
                    <div className="col-xl-3 col-lg-4 order-2 order-md-1">
                        <ShopSidebar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            minPrice={minPrice}
                            setMinPrice={setMinPrice}
                            maxPrice={maxPrice}
                            setMaxPrice={setMaxPrice}
                            selectedSizes={selectedSizes}
                            setSelectedSizes={setSelectedSizes}
                            selectedColors={selectedColors}
                            setSelectedColors={setSelectedColors}
                        />
                    </div>
                    <div className="col-xl-9 col-lg-8 order-1 order-md-2">
                        <div className="woocommerce-notices-wrapper">
                            <p>Display<span>{currentProducts.length}</span> trên {totalFilteredResults} kết quả</p>
                            <div className="form-clt">
                                <div className="nice-select" style={{ marginRight: '15px' }}>
                                    <select value={sortOption} onChange={handleSortChange} className="form-select">
                                        <option value="1">Default sorting</option>
                                        <option value="2">Price: Low to High</option>
                                        <option value="3">Price: High to Low</option>
                                        <option value="4">Name: A to Z</option>
                                        <option value="5">Name: Z to A</option>
                                        <option value="6">Latest</option>
                                    </select>
                                </div>
                                <div className="icon">
                                    <button
                                        className={`tab ${activeTab === 'Tab1' ? 'active' : ''}`}
                                        onClick={() => openTab('Tab1')}
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                </div>
                                <div className="icon">
                                    <button
                                        className={`tab ${activeTab === 'Tab2' ? 'active' : ''}`}
                                        onClick={() => openTab('Tab2')}
                                    >
                                        <i className="fas fa-th-large"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            {currentProducts.map((product) => (
                                <Link
                                    to={`/shop-details/Calendar-printing-design/${product._id}`}
                                    key={product._id}
                                    className="col-lg-4 col-md-6 col-12"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="product-box-items">
                                        <div className="product-image">
                                            <img src={product.images[0]} alt="img" />
                                            <ul className="product-icon d-grid align-items-center">
                                                <li>
                                                    <button onClick={(e) => { e.stopPropagation(); addToCartProduct(product); }}>
                                                        <i className="fa-sharp fa-regular fa-eye"></i>
                                                    </button>
                                                </li>
                                                <li>
                                                    <Link onClick={ClickHandler} to="#"><i className="fa-regular fa-star"></i></Link>
                                                </li>
                                                <li>
                                                    <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                        <i className="fa-regular fa-arrow-up-arrow-down"></i>
                                                    </Link>
                                                </li>
                                            </ul>
                                            <div className="shop-btn">
                                                <button onClick={(e) => { e.stopPropagation(); addToCartProduct(product); }} className="theme-btn">
                                                    Add To Cart
                                                </button>
                                            </div>
                                        </div>
                                        <div className="product-content">
                                            <div className="star">
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="fa-solid fa-star"></i>
                                                <i className="color-2 fa-solid fa-star"></i>
                                            </div>
                                            <h6>
                                                <Link onClick={ClickHandler} to={`/shop-details/${product.slug}`}>
                                                    {product.name}
                                                </Link>
                                            </h6>
                                            <span>{product.price} VND</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="page-nav-wrap mt-5 text-center">
                            <ul>
                                <li>
                                    <button
                                        className="page-numbers"
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fa-solid fa-chevrons-left"></i>
                                    </button>
                                </li>
                                {Array.from({ length: totalFilteredPages }, (_, i) => (
                                    <li key={i}>
                                        <button
                                            className={`page-numbers ${currentPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        className="page-numbers"
                                        onClick={() => handlePageChange(Math.min(totalFilteredPages, currentPage + 1))}
                                        disabled={currentPage === totalFilteredPages}
                                    >
                                        <i className="fa-solid fa-chevrons-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default ShopProduct;
export { ShopProduct as InkMeShopProduct };
