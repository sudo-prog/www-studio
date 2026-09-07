import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';

import { Link } from "react-router-dom";
import { MyContext } from '../../context/MyContext';
import { deleteData, editData, fetchDataFromApi } from "../../utils/api";
import QuantityBox from "../../components/QuantityBox";
import InkMeFile from './InkMeFile';
import ColorSizeSelector from './ColorSizeSelector';
import './Cart.css';

const CartPage = () => {
  const ClickHandler = () => {
    window.scrollTo(10, 0);
  };

  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState({});
  const [selectedQuantity, setSelectedQuantity] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);

  const context = useContext(MyContext);

  // Helper function to update cart data
  const updateCartData = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.userId) return;

    fetchDataFromApi(`/api/cart?userId=${user.userId}`).then((res) => {
      // Ensure res is always an array
      const cartArray = Array.isArray(res) ? res : [];
      setCartData(cartArray);
      context.setCartData(cartArray);
      // Initialize quantities
      const initialQuantities = {};
      cartArray.forEach(item => {
        initialQuantities[item._id] = item.quantity;
      });
      setSelectedQuantity(initialQuantities);
      // Calculate total
      const total = cartArray.reduce((sum, item) => sum + item.subTotal, 0);
      setTotalAmount(total);
    });
  }, []);

  useEffect(() => {
    updateCartData();
  }, []); // Only run once on mount

  const removeItem = (id) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    deleteData(`/api/cart/${id}`).then((res) => {
      context.setAlterBox({
        open: true,
        error: false,
        message: "Product deleted successfully"
      });
      updateCartData();
    }).finally(() => {
      setLoading(prev => ({ ...prev, [id]: false }));
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    setLoading(prev => ({ ...prev, [item._id]: true }));

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.userId) return;

      const cartFields = {
        productTitle: item.productTitle,
        images: item.images,
        rating: item.rating,
        price: item.price,
        quantity: newQuantity,
        subTotal: item.price * newQuantity,
        productId: item.productId,
        userId: user.userId,
        inkmeFile: item.inkmeFile,
        productColor: item.productColor,
        productSize: item.productSize,
        classifications: item.classifications?.map(cls => ({
          ...cls,
          quantity: newQuantity,
          subTotal: cls.price * newQuantity
        }))
      };

      await editData(`/api/cart/${item._id}`, cartFields);
      updateCartData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(prev => ({ ...prev, [item._id]: false }));
    }
  };

  const updateColorSize = async (item, options) => {
    setLoading(prev => ({ ...prev, [item._id]: true }));

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.userId) return;

      // Create new classification name from size and color
      const newName = `${options.size || ''} - ${options.color || ''}`.trim().replace(/^-\s*|-\s*$/g, '') || 'Undefined';

      const cartFields = {
        productTitle: item.productTitle,
        images: item.images,
        rating: item.rating,
        price: item.price,
        quantity: item.quantity,
        subTotal: item.subTotal,
        productId: item.productId,
        userId: user.userId,
        productColor: options.color || item.productColor,
        productSize: options.size || item.productSize,
        inkmeFile: item.inkmeFile,
        classifications: [{
          name: newName,
          image: item.classifications?.[0]?.image || item.images[0] || '',
          price: item.price,
          quantity: item.quantity,
          subTotal: item.subTotal
        }]
      };

      await editData(`/api/cart/${item._id}`, cartFields);
      updateCartData();

      context.setAlterBox({
        open: true,
        error: false,
        message: "Updated successfully"
      });
    } catch (error) {
      console.error('Error updating color/size:', error);
      context.setAlterBox({
        open: true,
        error: true,
        message: "An error occurred during update"
      });
    } finally {
      setLoading(prev => ({ ...prev, [item._id]: false }));
    }
  };

  return (
    <Fragment>
      <NavbarS2 hclass={'header-section-2 style-two'} />
      <PageTitle pageTitle={'ImkMe - 3D Printing'} pagesub={'Shopping Cart'} />

      <section className="cart-section section-padding section-bg-2">
        <div className="container cart-page-container">
          <div className="main-cart-wrapper">
            <div className="row">
              <div className="col-12">
                <div className="cart-wrapper">
                  <div className="cart-items-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Color</th>
                          <th>Size</th>
                          <th>Giá</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(cartData) && cartData.length !== 0 ? (
                          cartData.map((item) => {
                            return (
                              <React.Fragment key={item._id}>
                                <tr className="cart-item">
                                  <td className="cart-item-info">
                                    <div className="tooltip-wrapper">
                                      {item.inkmeFile ? (
                                        <div className="cart-item-image-wrapper">
                                          <InkMeFile inkmeFile={item.inkmeFile} />
                                        </div>
                                      ) : (
                                        <img
                                          src={item.images[0]}
                                          alt={item.productTitle}
                                          className="product-image"
                                          style={{ width: '150px', height: '150px' }}
                                        />
                                      )}
                                      <span className="tooltip-glass">{item.productTitle}</span>
                                    </div>
                                  </td>

                                  <td className="cart-item-color">
                                    {item.inkmeFile ? (
                                      <span className="text-muted"></span>
                                    ) : (
                                      <ColorSizeSelector
                                        item={item}
                                        onUpdate={updateColorSize}
                                        loading={loading[item._id]}
                                        type="color"
                                      />
                                    )}
                                  </td>

                                  <td className="cart-item-size">
                                    {item.inkmeFile ? (
                                      <span className="text-muted"></span>
                                    ) : (
                                      <ColorSizeSelector
                                        item={item}
                                        onUpdate={updateColorSize}
                                        loading={loading[item._id]}
                                        type="size"
                                      />
                                    )}
                                  </td>

                                  <td className="cart-item-price">
                                    <span className="base-price">{formatCurrency(item.price)}</span>
                                  </td>

                                  <td>
                                    <div className="cart-item-quantity">
                                      <QuantityBox
                                        item={item}
                                        value={selectedQuantity[item._id]}
                                        onQuantityChange={(newQuantity) => updateQuantity(item, newQuantity)}
                                        loading={loading[item._id]}
                                      />
                                    </div>
                                  </td>

                                  <td className="cart-item-price">
                                    <span className="total-price">{formatCurrency(item.subTotal)}</span>
                                  </td>

                                  <td className="cart-item-remove">
                                    <button
                                      onClick={() => removeItem(item._id)}
                                      disabled={loading[item._id]}
                                      className="remove-btn"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </td>
                                </tr>
                              </React.Fragment>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <div className="empty-cart">
                                <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                                <h5>Empty cart</h5>
                                <p className="text-muted">Please add products to the cart to start shopping</p>
                                <Link to="/shop" className="theme-btn mt-3">
                                  <span>Continue shopping</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="cart-items-mobile">
                    {Array.isArray(cartData) && cartData.length !== 0 ? (
                      cartData.map((item) => (
                        <div key={item._id} className="cart-item-card">
                          <div className="cart-item-remove-mobile">
                            <button
                              onClick={() => removeItem(item._id)}
                              disabled={loading[item._id]}
                              className="remove-btn"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>

                          <div className="cart-item-card-header">
                            <div className="cart-item-card-image">
                              {item.inkmeFile ? (
                                <div className="cart-item-image-wrapper">
                                  <InkMeFile inkmeFile={item.inkmeFile} />
                                </div>
                              ) : (
                                <img
                                  src={item.images[0]}
                                  alt={item.productTitle}
                                  className="product-image"
                                />
                              )}
                            </div>
                            <div className="cart-item-card-info">
                              <h6 className="cart-item-card-title">{item.productTitle}</h6>
                              <p className="cart-item-card-price">{formatCurrency(item.price)}</p>
                            </div>
                          </div>

                          <div className="cart-item-card-details">
                            {!item.inkmeFile && (
                              <>
                                <div className="cart-item-detail-group">
                                  <span className="cart-item-detail-label">Color</span>
                                  <ColorSizeSelector
                                    item={item}
                                    onUpdate={updateColorSize}
                                    loading={loading[item._id]}
                                    type="color"
                                  />
                                </div>
                                <div className="cart-item-detail-group">
                                  <span className="cart-item-detail-label">Size</span>
                                  <ColorSizeSelector
                                    item={item}
                                    onUpdate={updateColorSize}
                                    loading={loading[item._id]}
                                    type="size"
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          <div className="cart-item-actions">
                            <div className="cart-item-quantity-wrapper">
                              <span className="cart-item-detail-label">Quantity</span>
                              <QuantityBox
                                item={item}
                                value={selectedQuantity[item._id]}
                                onQuantityChange={(newQuantity) => updateQuantity(item, newQuantity)}
                                loading={loading[item._id]}
                              />
                            </div>
                            <div className="cart-item-total">
                              <span className="cart-item-total-label">Total</span>
                              <span className="cart-item-total-price">{formatCurrency(item.subTotal)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-cart">
                        <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                        <h5>Empty cart</h5>
                        <p className="text-muted">Please add products to the cart to start shopping</p>
                        <Link to="/shop" className="theme-btn mt-3">
                          <span>Continue shopping</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="cart-wrapper-footer">
                    <form>
                      <input type="text" name="promo-code" id="promoCode" placeholder="Discount code" />
                      <button type="submit" className="theme-btn">
                        <span>Apply</span>
                      </button>
                    </form>

                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6"></div>
              <div className="col-xl-6">
                <div className="cart-pragh-box">
                  <div className="cart-graph">
                    <h4>Cart total</h4>
                    <ul>
                      <li>
                        <span>Subtotal</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </li>
                      <li>
                        <span>Shipping fee</span>
                        <span>Free</span>
                      </li>
                      <li>
                        <span>Total</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </li>
                    </ul>
                    <div className="chck">
                      <Link onClick={ClickHandler} to="/checkout" className="theme-btn">
                        <span>Thanh toán</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaSectionS2 />
      <FooterS3 />

    </Fragment>
  );
};

// export default CartPage;











export { CartPage as InkMeCartPage };
