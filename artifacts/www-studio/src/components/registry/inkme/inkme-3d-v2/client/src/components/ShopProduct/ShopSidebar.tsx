import React from 'react';
import { Link } from 'react-router-dom';
import RangeBarCustom from './RangeBarCustom';
import FilterSize from './handleCheckboxChange';
import FilterColor from './FilterColor';
import { getCategorys } from '../../services/ShopServices';
import * as React from 'react'; // originally: import { useEffect, useState } from 'react';
import './ShopFilters.css';

const ClickHandler = () => {
    window.scrollTo(10, 0);
};

const ShopSidebar = ({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors
}) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategory = async () => {
            const response = await getCategorys();
            setCategories(response.categoryList);
        };
        fetchCategory();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setMinPrice(0);
        setMaxPrice(Infinity);
        setSelectedSizes([]);
        setSelectedColors([]);
    };

    return (
        <div className="shop-main-sidebar">
            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h4>Search products</h4>
                </div>
                <div className="search_widget">
                    <form action="#">
                        <input
                            type="text"
                            placeholder="Search products"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                            style={{ textTransform: 'none' }}
                        />
                        <button type="submit" className="search-button">
                            <i className="fal fa-search"></i>
                        </button>
                    </form>
                </div>
            </div>

            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h4>Category</h4>
                </div>
                <div className="shop-catagory-items">
                    <ul className="category-list">
                        <li
                            onClick={() => handleCategorySelect('')}
                            className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
                            style={{
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '5px',
                                backgroundColor: selectedCategory === '' ? '#f0f0f0' : 'transparent'
                            }}
                        >
                            <i className="fa-regular fa-chevron-left"></i>All categories</li>
                        {categories.map((category, index) => (
                            <li
                                key={index}
                                onClick={() => handleCategorySelect(category._id)}
                                className={`category-item ${selectedCategory === category._id ? 'active' : ''}`}
                                style={{
                                    cursor: 'pointer',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor: selectedCategory === category._id ? '#f0f0f0' : 'transparent'
                                }}
                            >
                                <i className="fa-regular fa-chevron-left"></i>
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h4>Filter by price</h4>
                </div>
                <RangeBarCustom
                    setMinPrice={setMinPrice}
                    setMaxPrice={setMaxPrice}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                />
            </div>

            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h4>Filter by size</h4>
                </div>
                <FilterSize
                    selectedSizes={selectedSizes}
                    setSelectedSizes={setSelectedSizes}
                />
            </div>

            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h4>Filter by color</h4>
                </div>
                <FilterColor
                    selectedColors={selectedColors}
                    setSelectedColors={setSelectedColors}
                />
            </div>

            <div className="single-sidebar-widget">
                <div className="filter-actions" style={{ marginTop: '20px' }}>
                    <button
                        onClick={clearAllFilters}
                        className="theme-btn w-100"
                        style={{
                            background: '#dc3545',
                            border: 'none',
                            padding: '10px 15px',
                            borderRadius: '5px',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >Clear all filters</button>
                </div>
            </div>
        </div>
    );
};

// export default ShopSidebar;
export { ShopSidebar as InkMeShopSidebar };
