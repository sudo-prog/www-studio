import * as React from 'react';
import { Link } from 'react-router-dom'
import { connect } from "react-redux";
import { removeFromCart } from "../../../store/actions/action";
import HeaderTopbarS2 from '../HeaderTopbarS2/HeaderTopbarS2';
import Logo from '../../../img/logo/inkme-logo-gradient.png';
import Home1 from '../../../img/header/home-1.jpg';
import Home2 from '../../../img/header/home-2.jpg';
import Home3 from '../../../img/header/home-3.jpg';
import MobileMenu from '../../MobileMenu/MobileMenu';
import { useMyContext } from '../../../context/MyContext';


const HeaderS2 = (props) => {

    

    const SubmitHandler = (e) => {
        e.preventDefault()
    }

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const { cartData } = useMyContext();

    const totalQuantity = cartData.length;

    const [isSticky, setIsSticky] = useState(false);

    const { user } = useMyContext();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 250) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header className={props.hclass}>
            <HeaderTopbarS2 />
            <div id="header-sticky" className={isSticky ? 'header-1 style-2 sticky' : 'header-1 style-2'}>
                <div className="container-fluid">
                    <div className="mega-menu-wrapper">
                        <div className="header-main">
                            <div className="header-left">
                                <div className="logo">
                                    <Link onClick={ClickHandler} to="/" className="header-logo">
                                        <img src={Logo} alt="logo-img" />
                                    </Link>
                                </div>
                            </div>
                            <div className="mean__menu-wrapper">
                                <div className="main-menu">
                                    <nav id="mobile-menu">
                                        <ul>
                                            <li className="has-dropdown active menu-thumb">
                                                <Link onClick={ClickHandler} to="/home">
                                                    Trang chủ
                                                </Link>

     <li>
 <Link onClick={ClickHandler} to="">
 Services
 </Link>
 <ul className="">
 <li><Link onClick={ClickHandler} to="">Services</Link></li>
 <li><Link onClick={ClickHandler} to="">Service Details</Link></li>
 </ul>
 </li>ndler} to="#">
                                                    Dịch vụ
                                                </Link>
                                                <ul className="submenu">
                                                    <li><Link onClick={ClickHandler} to="/service">Services</Link></li>
                           <li className="">
 <Link onClick={ClickHandler} to="">
 Products
 </Link>
 <ul className="">
 <li><Link onClick={ClickHandler} to="">Projects</Link></li>
 <li><Link onClick={ClickHandler} to="">Project Details</Link></li>
 <li><Link onClick={ClickHandler} to="">404 Page</Link></li>
 </ul>
 </li>                    Sản phẩm
                      <li>
 <Link onClick={ClickHandler} to="">
 Shop
 </Link>
 <ul className="">
 <li><Link onClick={ClickHandler} to="">Shop Page</Link></li>
 <li><Link onClick={ClickHandler} to="">Shop Details</Link></li>
 <li><Link onClick={ClickHandler} to="">Shop Cart</Link></li>
 <li><Link onClick={ClickHandler} to="">Checkout</Link></li>
 </ul>
 </li>                    </Link>
                                                <ul className="submenu">
                                                    <li><Link onClick={ClickHandler} to="/shop">Shop Page</Link></li>
                                                    <li><Link onClick={ClickHandler} to="/shop-details/Calendar-printing-design">Shop Details</Link></li>
                                                    <li><Link onClick={ClickHandler} to="/shop-cart">Shop Cart</Link></li>
                                                    <li><Link onClick={ClickHandler} to="/checkout">Checkout</Link></li>
                                                </ul>
                                            </li> */}
                                            <li>
                                                <Link onClick={ClickHandler} to="#">
                                                    Tin tức
                                                </Link>
                                                <ul className="submenu">
                                                    <li><Link onClick={ClickHandler} to="/news">Blog</Link></li>
                                                    <li><Link onClick={ClickHandler} to="/blog-single/How-To-Teach-Kids-Ramadan-Isn't-About-Food">Blog Details</Link></li>
                                                </ul>
                                            </li>

                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            <div className="header-right d-flex justify-content-end align-items-center">
                                <div className="menu-cart">
                                    <Link onClick={ClickHandler} to={`/shop-cart/${user?.userId}`} className="cart-icon">
                                        <i className="far fa-shopping-basket"></i>
                                        <span>{totalQuantity}</span>
                                    </Link>
                                </div>
                                <div className="content">
                                    <p>HOTLINE</p>
                                    <h5><a onClick={ClickHandler} to="del:0968338829">0968338829</a></h5>
                                </div>
                                <div className="header-button">
                                    <Link onClick={ClickHandler} to="/contact" className="theme-btn">Liên hệ</Link>
                                </div>
                                <div className="header__hamburger d-xl-none my-auto">
                                    <div className="sidebar__toggle">
                                        <MobileMenu />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
const mapStateToProps = (state) => {
    return {
        carts: state.cartList.cart,
    };
};


// export default connect(mapStateToProps, { removeFromCart })(HeaderS2);









export { HeaderS2 as InkMeHeaderS2 };
