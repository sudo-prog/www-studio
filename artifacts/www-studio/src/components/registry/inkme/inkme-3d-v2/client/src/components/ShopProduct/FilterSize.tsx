import * as React from 'react';

const FilterSize = ({ selectedSizes, setSelectedSizes }) => {
    const sizes = ['S', 'M', 'L', 'XL'];

    const handleCheckboxChange = (size) => {
        if (selectedSizes.includes(size)) {
            // Remove size if already selected
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            // Add size if not selected
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    return (
        <div className="filter-size">
            {sizes.map((size, index) => (
                <label key={index} className="checkbox-single">
                    <span className="d-flex gap-xl-3 gap-2 align-items-center">
                        <span className="checkbox-area d-center">
                            <input
                                type="checkbox"
                                name={`size${index + 1}`}
                                checked={selectedSizes.includes(size)}
                                onChange={() => handleCheckboxChange(size)}
                            />
                            <span className="checkmark d-center"></span>
                        </span>
                        <span className="text-color">{size}</span>
                    </span>
                </label>
            ))}
        </div>
    );
};

// export default FilterSize;
export { FilterSize as InkMeFilterSize };
