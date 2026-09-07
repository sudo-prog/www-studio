import * as React from 'react';
import { Link } from 'react-router-dom';

const ClickHandler = () => {
    window.scrollTo(10, 0);
};

const RangeBarCustom = ({ setMinPrice, setMaxPrice, minPrice, maxPrice }) => {
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(1000000);
    const [inputMin, setInputMin] = useState(0);
    const [inputMax, setInputMax] = useState(1000000);

    // Initialize values from props
    useEffect(() => {
        if (minPrice !== undefined && minPrice !== 0) {
            setMinValue(minPrice);
            setInputMin(minPrice);
        }
        if (maxPrice !== undefined && maxPrice !== Infinity) {
            setMaxValue(maxPrice);
            setInputMax(maxPrice);
        }
    }, [minPrice, maxPrice]);

    const handleMinChange = (e) => {
        const value = Math.min(+e.target.value, maxValue - 10000);
        setMinValue(value);
        setInputMin(value);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(+e.target.value, minValue + 10000);
        setMaxValue(value);
        setInputMax(value);
    };

    const handleInputMinChange = (e) => {
        const value = Math.min(+e.target.value, inputMax - 10000);
        setInputMin(value);
        setMinValue(value);
    };

    const handleInputMaxChange = (e) => {
        const value = Math.max(+e.target.value, inputMin + 10000);
        setInputMax(value);
        setMaxValue(value);
    };

    const handlePriceRangeSelect = (min, max) => {
        setMinPrice(min);
        setMaxPrice(max);
        setMinValue(min);
        setMaxValue(max === Infinity ? 1000000 : max);
        setInputMin(min);
        setInputMax(max === Infinity ? 1000000 : max);
    };

    const applyPriceFilter = () => {
        setMinPrice(inputMin);
        setMaxPrice(inputMax);
    };

    return (
        <div className="range__barcustom">
            <div className="slider">
                <div
                    className="progress"
                    style={{
                        left: `${(minValue / 1000000) * 100}%`,
                        right: `${100 - (maxValue / 1000000) * 100}%`
                    }}
                ></div>
            </div>
            <div className="range-input">
                <input
                    type="range"
                    className="range-min"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={minValue}
                    onChange={handleMinChange}
                />
                <input
                    type="range"
                    className="range-max"
                    min="10000"
                    max="1000000"
                    step="10000"
                    value={maxValue}
                    onChange={handleMaxChange}
                />

                <div className="range-items">
                    <div className="price-input d-flex">
                        <div className="field">
                            <span>₫</span>
                            <input
                                type="number"
                                className="input-min"
                                value={inputMin}
                                onChange={handleInputMinChange}
                                min="0"
                                step="10000"
                            />
                        </div>
                        <div className="separators">-</div>
                        <div className="field">
                            <span>₫</span>
                            <input
                                type="number"
                                className="input-max"
                                value={inputMax}
                                onChange={handleInputMaxChange}
                                min="10000"
                                step="10000"
                            />
                        </div>
                        <button
                            onClick={applyPriceFilter}
                            className="theme-btn border-radius-none"
                            type="button"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            </div>
            <ul className="price-range-list" style={{ listStyleType: 'none', padding: 0 }}>
                <li
                    onClick={() => handlePriceRangeSelect(0, 100000)}
                    className="price-range-item"
                    style={{
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: minPrice === 0 && maxPrice === 100000 ? '#007bff' : '#f0f0f0',
                        color: minPrice === 0 && maxPrice === 100000 ? 'white' : 'black',
                        margin: '5px 0',
                        transition: 'all 0.3s'
                    }}
                >Under 100k</li>
                <li
                    onClick={() => handlePriceRangeSelect(100000, 300000)}
                    className="price-range-item"
                    style={{
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: minPrice === 100000 && maxPrice === 300000 ? '#007bff' : '#f0f0f0',
                        color: minPrice === 100000 && maxPrice === 300000 ? 'white' : 'black',
                        margin: '5px 0',
                        transition: 'all 0.3s'
                    }}
                >
                    100k - 300k
                </li>
                <li
                    onClick={() => handlePriceRangeSelect(300000, 500000)}
                    className="price-range-item"
                    style={{
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: minPrice === 300000 && maxPrice === 500000 ? '#007bff' : '#f0f0f0',
                        color: minPrice === 300000 && maxPrice === 500000 ? 'white' : 'black',
                        margin: '5px 0',
                        transition: 'all 0.3s'
                    }}
                >
                    300k - 500k
                </li>
                <li
                    onClick={() => handlePriceRangeSelect(500000, Infinity)}
                    className="price-range-item"
                    style={{
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: minPrice === 500000 && maxPrice === Infinity ? '#007bff' : '#f0f0f0',
                        color: minPrice === 500000 && maxPrice === Infinity ? 'white' : 'black',
                        margin: '5px 0',
                        transition: 'all 0.3s'
                    }}
                >
                    Trên 500k
                </li>
            </ul>
        </div>
    );
}

// export default RangeBarCustom;
export { RangeBarCustom as InkMeRangeBarCustom };
