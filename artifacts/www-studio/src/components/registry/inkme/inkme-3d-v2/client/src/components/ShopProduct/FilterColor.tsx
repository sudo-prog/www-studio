import * as React from 'react';

const FilterColor = ({ selectedColors, setSelectedColors }) => {
    const colors = [
        { value: 'red', label: 'Red', hex: '#FF0000' },
        { value: 'blue', label: 'Blue', hex: '#0000FF' },
        { value: 'green', label: 'Xanh lá', hex: '#00FF00' },
        { value: 'yellow', label: 'Vàng', hex: '#FFFF00' },
        { value: 'black', label: 'Black', hex: '#000000' },
        { value: 'white', label: 'White', hex: '#FFFFFF' },
        { value: 'pink', label: 'Pink', hex: '#FFC0CB' },
        { value: 'purple', label: 'Tím', hex: '#800080' },
        { value: 'orange', label: 'Cam', hex: '#FFA500' },
        { value: 'brown', label: 'Nâu', hex: '#8B4513' },
        { value: 'gray', label: 'Xám', hex: '#808080' },
        { value: 'navy', label: 'Xanh navy', hex: '#000080' }
    ];

    const handleColorToggle = (colorValue) => {
        if (selectedColors.includes(colorValue)) {
            // Remove color if already selected
            setSelectedColors(selectedColors.filter(c => c !== colorValue));
        } else {
            // Add color if not selected
            setSelectedColors([...selectedColors, colorValue]);
        }
    };

    return (
        <div className="filter-colors">
            <div className="color-grid">
                {colors.map((color, index) => (
                    <div key={index} className="color-item-wrapper">
                        <div
                            className={`color-circle ${selectedColors.includes(color.value) ? 'selected' : ''}`}
                            style={{
                                backgroundColor: color.hex,
                                border: color.value === 'white' ? '2px solid #ddd' : '2px solid transparent'
                            }}
                            onClick={() => handleColorToggle(color.value)}
                            title={color.label}
                        >
                            {selectedColors.includes(color.value) && (
                                <span className="color-checkmark">
                                    <i className="fas fa-check"></i>
                                </span>
                            )}
                        </div>
                        <span className="color-label">{color.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// export default FilterColor;
export { FilterColor as InkMeFilterColor };
