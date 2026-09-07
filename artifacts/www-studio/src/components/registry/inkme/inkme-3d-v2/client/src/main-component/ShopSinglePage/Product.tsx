import * as React from 'react';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../context/MyContext';
import { BsCartFill } from 'react-icons/bs';
import { trackViewProduct } from '../../utils/analytics';

const Product = ({ product }) => {
  const context = useContext(MyContext);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [tabError, setTabError] = useState(false);
  const [activeSize, setActiveSize] = useState(null);
  const [activeColor, setActiveColor] = useState(null);

  const navigate = useNavigate();
  // Enhanced Color Detection System
  const getColorFromName = (colorName) => {
    if (!colorName) return '#cccccc';

    const name = colorName.toLowerCase().trim();

    // Extended color mapping with variations
    const colorMap = {
      //Vietnamese - Blue variants
      'Blue': '#3b82f6',
      'Deep blue': '#1d4ed8',
      'Light blue': '#60a5fa',
      'Bright blue': '#3b82f6',
      'Dark blue': '#1e40af',
      'Navy blue': '#1e3a8a',
      'Royal blue': '#2563eb',

      //Vietnamese - Green variants
      'xanh lá': '#22c55e',
      'Dark green': '#16a34a',
      'xanh lá nhạt': '#4ade80',
      'xanh lá sáng': '#22c55e',
      'xanh lá tối': '#166534',
      'xanh lá olive': '#84cc16',
      'xanh lá cây': '#22c55e',

      //Vietnamese - Blue variants
      'xanh lam': '#06b6d4',
      'Dark blue': '#0891b2',
      'xanh lam nhạt': '#22d3ee',
      'xanh lam sáng': '#06b6d4',
      'xanh lam tối': '#164e63',
      'Turquoise': '#14b8a6',
      'Sea blue': '#0ea5e9',

      //Vietnamese - Red variants
      'red': '#ef4444',
      'deep red': '#dc2626',
      'light red': '#f87171',
      'bright red': '#ef4444',
      'dark red': '#991b1b',
      'cherry red': '#dc2626',
      'red pink': '#f43f5e',
      'red orange': '#f97316',

      //Vietnamese - Gold variants
      'vàng': '#fbbf24',
      'Deep yellow': '#f59e0b',
      'Light yellow': '#fde047',
      'vàng sáng': '#fbbf24',
      'Dark yellow': '#d97706',
      'vàng chanh': '#eab308',
      'vàng cam': '#f59e0b',
      'vàng gold': '#fbbf24',

      //Vietnamese - Purple variants
      'tím': '#a855f7',
      'Deep purple': '#9333ea',
      'Light purple': '#c084fc',
      'tím sáng': '#a855f7',
      'Dark purple': '#7c3aed',
      'tím violet': '#8b5cf6',
      'tím lavender': '#c084fc',

      //Vietnamese - Pink variants
      'Pink': '#ec4899',
      'Deep pink': '#db2777',
      'Pale pink': '#f472b6',
      'Light pink': '#ec4899',
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
      'Dark grey': '#6b7280',
      'Light grey': '#d1d5db',
      'Dark grey': '#374151',
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
        if (modifier && name.includes('Red')) {
          return modifier === 'darken' ? '#dc2626' : '#f87171';
        }
        // Add more modifier logic as needed
      }
    }

    // Color name extraction
    const colorKeywords = ['xanh', 'Red', 'vàng', 'tím', 'Pink', 'cam', 'Black', 'White', 'xám', 'nâu',
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

  useEffect(() => {
    window.scrollTo(10, 0);

    // Google Analytics tracking - Product View
    if (product) {
      trackViewProduct({
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category || 'Custom Print'
      });
    }
  }, [product]);

  const user = JSON.parse(localStorage.getItem('user'));

  const handleAddToCart = () => {
    setTabError(false);

    if (!user) {
      context.setAlterBox({
        open: true,
        error: true,
        message: "Please log in to add products to the cart",
      });
      setTimeout(() => {
        navigate('/login');
      }, 1000);

      return;
    }

    if ((product.color && product.color.length > 0 && !selectedColor) ||
      (product.productSize && product.productSize.length > 0 && !selectedSize)) {
      setTabError(true);
      return;
    }

    const productToAdd = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };

    context.addToCart(productToAdd);

    // Reset selections after adding to cart
    setActiveSize(null);
    setActiveColor(null);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
  };

  const selectImage = (index) => {
    setSelectedImage(index);
  };

  const selectSize = (size, index) => {
    setSelectedSize(size);
    setActiveSize(index);
    setTabError(false);
  };

  const selectColor = (color, index) => {
    setSelectedColor(color);
    setActiveColor(index);
    setTabError(false);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    if (selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage < product.images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  return (
    <div className="row g-5">
      <div className="col-md-6">
        <div className="sliderWrapper pt-3 pb-3 ps-4 pe-4">

          {/* Main Image Display */}
          <div className="main-image mb-3" style={{ position: 'relative' }}>
            {product?.images && product.images.length > 0 ? (
              <>
                <Zoom>
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-100"
                    style={{
                      width: '600px',
                      height: '600px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Zoom>

                {/* Navigation Buttons */}
                {product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={goToPrevious}
                      disabled={selectedImage === 0}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: selectedImage === 0 ? 'not-allowed' : 'pointer',
                        opacity: selectedImage === 0 ? 0.3 : 1,
                        transition: 'all 0.3s ease',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        if (selectedImage !== 0) {
                          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                      }}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={goToNext}
                      disabled={selectedImage === product.images.length - 1}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: selectedImage === product.images.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: selectedImage === product.images.length - 1 ? 0.3 : 1,
                        transition: 'all 0.3s ease',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        if (selectedImage !== product.images.length - 1) {
                          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                      }}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>

                    {/* Image Counter */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {selectedImage + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-image d-flex align-items-center justify-content-center"
                style={{
                  width: '600px',
                  height: '600px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                <span>No image</span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product?.images && product.images.length > 1 && (
            <div className="thumbnail-images d-flex gap-2 justify-content-center">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => selectImage(index)}
                  style={{
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    transform: selectedImage === index ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="col-lg-6">
        <div className="product-details-content">
          <div className="star pb-4">
            {product.discount && <span className="badge bg-danger me-2">{product.discount}%</span>}
            <span>{product.rating} <i className="fa-solid fa-star text-warning"></i></span>
          </div>
          <h3 className="pb-4 split-text right">{product.name}</h3>
         
          <div className="price-list d-flex align-items-center mb-4">
            <span className="fw-bold fs-4 text-primary me-3">
              {product.price?.toLocaleString('vi-VN')} VND
            </span>
            {product.oldPrice && (
              <del className="text-muted">
                {product.oldPrice?.toLocaleString('vi-VN')} VND
              </del>
            )}
          </div>

          {/* Color Selection */}
          {product.color && product.color.length > 0 && (
            <div className="color-selection mb-3">
              <span className="fw-bold">Color:</span>
              {selectedColor && (
                <span className="ms-2 text-muted">({selectedColor})</span>
              )}
              <div className={`color-options mt-2 d-flex gap-2 align-items-center ${tabError && !selectedColor ? 'error' : ''}`}>
                {product.color.map((color, index) => {
                  const colorHex = getColorFromName(color);
                  const isSelected = activeColor === index;

                  return (
                    <div
                      key={index}
                      onClick={() => selectColor(color, index)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: colorHex,
                        border: isSelected ? '3px solid #007bff' : tabError && !selectedColor ? '2px solid #dc3545' : '2px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 0 2px rgba(0, 123, 255, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        position: 'relative'
                      }}
                      title={color}
                    >
                      {/* White border for light colors */}
                      {(() => {
                        const lightColors = ['White', 'white', 'vàng', 'yellow', 'Light Yellow', 'light yellow', 'vàng sáng', 'cream', 'beige'];
                        const colorLower = color.toLowerCase();
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
                  );
                })}
              </div>
              {tabError && !selectedColor && (
                <small className="text-danger">Vui lòng chọn màu sắc</small>
              )}
            </div>
          )}

          {/* Size Selection */}
          {product.productSize && product.productSize.length > 0 && (
            <div className="size-selection mb-3">
              <span className="fw-bold">Size:</span>
              <div className={`size-options mt-2 ${tabError && !selectedSize ? 'error' : ''}`}>
                {product.productSize.map((size, index) => (
                  <button
                    key={index}
                    className={`btn me-2 mb-2 ${activeSize === index ? 'btn-primary' : 'btn-outline-secondary'} ${tabError && !selectedSize ? 'border-danger' : ''}`}
                    onClick={() => selectSize(size, index)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {tabError && !selectedSize && (
                <small className="text-danger">Vui lòng chọn kích thước</small>
              )}
            </div>
          )}

          {/* Quantity Selection */}
          <div className="quantity-selection mb-4">
            <span className="fw-bold">Quantity:</span>
            <div className="quantity-controls d-flex align-items-center mt-2">
              <button
                className="btn btn-outline-secondary"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="mx-3 fw-bold">{quantity}</span>
              <button
                className="btn btn-outline-secondary"
                onClick={increaseQuantity}
              >
                +
              </button>
            </div>
          </div>

          <div className="cart-wrp">
            <div className="shop-button d-flex align-items-center">
              <button
                className="theme-btn me-3 btn-lg"
                onClick={handleAddToCart}
                disabled={context.addingInCart}
                style={{
                  opacity: context.addingInCart ? 0.7 : 1,
                  cursor: context.addingInCart ? 'not-allowed' : 'pointer'
                }}
              >
                <BsCartFill className="me-2" />{context.addingInCart? "Adding...": "Add to cart"}
              <Link to="#" className="star-icon">
                <i className="fal fa-star"></i>
              </Link>
            </div>
            {tabError && (
              <small className="text-danger mt-2 d-block">
                Vui lòng chọn đầy đủ thông tin sản phẩm
              </small>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// export default Product;
export { Product as InkMeProduct };
