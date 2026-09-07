import * as React from 'react';
import { fetchDataFromApi } from '../../utils/api';

const ColorSizeSelector = ({ item, onUpdate, loading, type }) => {
    const [options, setOptions] = useState([]);
    const [currentValue, setCurrentValue] = useState('');

    // Get current value from cart item
    useEffect(() => {
        if (type === 'color' && item.productColor) {
            setCurrentValue(item.productColor);
        } else if (type === 'size' && item.productSize) {
            setCurrentValue(item.productSize);
        }
    }, [item.productColor, item.productSize, type]);

    // Fetch product options when component mounts
    useEffect(() => {
        const fetchProductOptions = async () => {
            try {
                const productData = await fetchDataFromApi(`/api/products/${item.productId}`);
                if (productData) {
                    if (type === 'color') {
                        setOptions(productData.productColor || []);
                    } else if (type === 'size') {
                        setOptions(productData.productSize || []);
                    }
                }
            } catch (error) {
                console.error('Error fetching product options:', error);
            }
        };

        if (item.productId) {
            fetchProductOptions();
        }
    }, [item.productId, type]);

    const handleChange = (newValue) => {
        setCurrentValue(newValue);

        // Create update object with current values from cart item
        const updateData = {
            color: type === 'color' ? newValue : item.productColor,
            size: type === 'size' ? newValue : item.productSize
        };

        onUpdate(item, updateData);
    };

    // Enhanced Color Detection System
    const getColorFromName = (colorName) => {
        if (!colorName) return '#cccccc';

        const name = colorName.toLowerCase().trim();

        // Extended color mapping with variations
        const colorMap = {
            //Vietnamese - Blue variants
            'blue': '#3b82f6',
            'dark blue': '#1d4ed8',
            'light blue': '#60a5fa',
            'light blue': '#3b82f6',
            'dark blue': '#1e40af',
            'navy blue': '#1e3a8a',
            'royal blue': '#2563eb',

            //Vietnamese - Green variants
            'xanh lá': '#22c55e',
            'dark green': '#16a34a',
            'xanh lá nhạt': '#4ade80',
            'xanh lá sáng': '#22c55e',
            'xanh lá tối': '#166534',
            'xanh lá olive': '#84cc16',
            'xanh lá cây': '#22c55e',

            //Vietnamese - Blue variants
            'xanh lam': '#06b6d4',
            'dark blue': '#0891b2',
            'xanh lam nhạt': '#22d3ee',
            'xanh lam sáng': '#06b6d4',
            'xanh lam tối': '#164e63',
            'turquoise': '#14b8a6',
            'sea blue': '#0ea5e9',

            //Vietnamese - Red variants
            'red': '#ef4444',
            'dark red': '#dc2626',
            'light red': '#f87171',
            'bright red': '#ef4444',
            'dark red': '#991b1b',
            'cherry red': '#dc2626',
            'pinkish red': '#f43f5e',
            'red-orange': '#f97316',

            //Vietnamese - Yellow variants
            'vàng': '#fbbf24',
            'deep yellow': '#f59e0b',
            'light yellow': '#fde047',
            'vàng sáng': '#fbbf24',
            'dark yellow': '#d97706',
            'vàng chanh': '#eab308',
            'vàng cam': '#f59e0b',
            'vàng gold': '#fbbf24',

            //Vietnamese - Purple variants
            'tím': '#a855f7',
            'deep purple': '#9333ea',
            'light purple': '#c084fc',
            'tím sáng': '#a855f7',
            'dark purple': '#7c3aed',
            'tím violet': '#8b5cf6',
            'tím lavender': '#c084fc',

            //Vietnamese - Pink variants
            'pink': '#ec4899',
            'dark pink': '#db2777',
            'Pale pink': '#f472b6',
            'Bright pink': '#ec4899',
            'Dark pink': '#be185d',
            'Rose pink': '#f43f5e',
            'hồng pastel': '#f9a8d4',

            //Vietnamese - Orange variants
            'cam': '#f97316',
            'Deep orange': '#ea580c',
            'Light orange': '#fb923c',
            'cam sáng': '#f97316',
            'Dark orange': '#c2410c',
            'Red-orange': '#dc2626',

            //Vietnamese - Basic colors
            'Black': '#1f2937',
            'White': '#ffffff',
            'xám': '#9ca3af',
            'Deep gray': '#6b7280',
            'Light gray': '#d1d5db',
            'Dark gray': '#374151',
            'nâu': '#a3a3a3',
            'Dark brown': '#78716c',
            'Light brown': '#d6d3d1',
            'Silver': '#e5e7eb',

            // English variants
            'blue': '#3b82f6',
            'dark blue': '#1d4ed8',
            'light blue': '#60a5fa',
            'navy blue': '#1e3a8a',
            'royal blue': '#2563eb',
            'sky blue': '#0ea5e9',
            'cyan': '#06b6d4',
            'turquoise': '#14b8a6',

            'green': '#22c55e',
            'dark green': '#16a34a',
            'light green': '#4ade80',
            'lime green': '#84cc16',
            'emerald': '#10b981',
            'forest green': '#166534',

            'red': '#ef4444',
            'dark red': '#dc2626',
            'light red': '#f87171',
            'crimson': '#dc143c',
            'cherry red': '#dc2626',

            'yellow': '#fbbf24',
            'dark yellow': '#f59e0b',
            'light yellow': '#fde047',
            'golden': '#ffd700',
            'amber': '#f59e0b',

            'purple': '#a855f7',
            'dark purple': '#9333ea',
            'light purple': '#c084fc',
            'violet': '#8b5cf6',
            'lavender': '#c084fc',
            'indigo': '#6366f1',

            'pink': '#ec4899',
            'dark pink': '#db2777',
            'light pink': '#f472b6',
            'rose': '#f43f5e',
            'magenta': '#d946ef',

            'orange': '#f97316',
            'dark orange': '#ea580c',
            'light orange': '#fb923c',

            'black': '#1f2937',
            'white': '#ffffff',
            'gray': '#9ca3af',
            'grey': '#9ca3af',
            'dark gray': '#6b7280',
            'light gray': '#d1d5db',
            'brown': '#a3a3a3',
            'silver': '#e5e7eb',
            'gold': '#ffd700'
        };

        // Direct match
        if (colorMap[name]) {
            return colorMap[name];
        }

        // Fuzzy matching for complex color names
        const fuzzyMatch = (input, target) => {
            return input.includes(target) || target.includes(input);
        };

        // Try to find partial matches
        for (const [key, value] of Object.entries(colorMap)) {
            if (fuzzyMatch(name, key)) {
                return value;
            }
        }

        // Advanced pattern matching
        const patterns = [
            // Xanh patterns
            { pattern: /(xanh|blue).*?(dương|navy|royal)/, color: '#1e40af' },
            { pattern: /(xanh|green).*?(lá|lime|forest)/, color: '#22c55e' },
            { pattern: /(xanh|cyan|turquoise).*?(lam|biển)/, color: '#06b6d4' },

            //Red patterns
            { pattern: /(đỏ|red).*?(đậm|dark|cherry)/, color: '#dc2626' },
            { pattern: /(đỏ|red).*?(nhạt|light|pink)/, color: '#f87171' },

            // Vàng patterns
            { pattern: /(vàng|yellow).*?(đậm|dark|gold)/, color: '#f59e0b' },
            { pattern: /(vàng|yellow).*?(nhạt|light|pale)/, color: '#fde047' },

            // Tím patterns
            { pattern: /(tím|purple).*?(đậm|dark|deep)/, color: '#9333ea' },
            { pattern: /(tím|purple).*?(nhạt|light|lavender)/, color: '#c084fc' },

            // Intensity modifiers
            { pattern: /đậm|dark|deep|tối/, color: null, modifier: 'darken' },
            { pattern: /nhạt|light|pale|sáng/, color: null, modifier: 'lighten' },
        ];

        for (const { pattern, color, modifier } of patterns) {
            if (pattern.test(name)) {
                if (color) return color;

                // Apply modifier to base color
                if (modifier && name.includes('Blue')) {
                    return modifier === 'darken' ? '#1d4ed8' : '#60a5fa';
                }
                if (modifier && name.includes('red')) {
                    return modifier === 'darken' ? '#dc2626' : '#f87171';
                }
                // Add more modifier logic as needed
            }
        }

        // Color name extraction
        const colorKeywords = ['xanh', 'red', 'vàng', 'tím', 'Pink', 'cam', 'black', 'White', 'xám', 'nâu',
            'blue', 'red', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'gray', 'brown'];

        for (const keyword of colorKeywords) {
            if (name.includes(keyword)) {
                return colorMap[keyword] || '#cccccc';
            }
        }

        // Fallback: return a default color
        console.warn(`Unknown color: ${colorName}, using default gray`);
        return '#cccccc';
    };

    if (loading) {
        return <div className="spinner-border spinner-border-sm" role="status"></div>;
    }

    return (
        <div className="color-size-selector">{type === 'color'? (
 // Only display color without dropdown<div className="d-flex align-items-center">
                    {currentValue && (
                        <>
                            <div
                                className="color-preview me-2"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: getColorFromName(currentValue),
                                    borderRadius: '50%',
                                    border: '1px solid #ddd',
                                    display: 'inline-block',
                                    position: 'relative'
                                }}
                                title={currentValue}
                            >
                                {/* White border for light colors */}
                                {(() => {
                                    const lightColors = ['White', 'white', 'vàng', 'yellow', 'Light yellow', 'light yellow', 'vàng sáng', 'cream', 'beige'];
                                    const colorLower = currentValue.toLowerCase();
                                    const isLightColor = lightColors.some(lightColor => colorLower.includes(lightColor));
                                    return isLightColor && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: '2px',
                                                borderRadius: '50%',
                                                border: '1px solid #d1d5db'
                                            }}
                                        />
                                    );
                                })()}
                            </div>
                            <span className='color-name' style={{ fontSize: '14px' }}>{currentValue}</span>
                        </>
                    )}
                    {!currentValue && (
                        <span style={{ fontSize: '14px', color: '#999' }}>Không có màu</span>
                    )}
                </div>): (
 // Display dropdown for size<select
                    value={currentValue}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={loading}
                    className="form-select form-select-sm size-selector"
                    style={{ fontSize: '14px', padding: '4px 8px' }}
                >
                    <option value="" >Select size</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

// export default ColorSizeSelector; 
export { ColorSizeSelector as InkMeColorSizeSelector };
