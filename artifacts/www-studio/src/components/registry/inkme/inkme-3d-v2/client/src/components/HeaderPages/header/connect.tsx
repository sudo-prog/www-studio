import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { connect } from "react-redux";
import { removeFromCart } from "../../../store/actions/action";
import HeaderTopbar from '../HeaderTopbar/HeaderTopbar';
import { Avatar } from "@mui/material";
import { getUserById } from "../../../services/UserServices";
import avatarDefault from "../../../img/avatar_defaut.jpg";
// import Logo from '../../img/logo/black-logo.svg';
import Logo from '../../../img/logo/inkme-logo-gradient.png';
import Home1 from '../../../img/header/home-1.jpg';
import Home2 from '../../../img/header/home-2.jpg';
import Home3 from '../../../img/header/home-3.jpg';
import SearchComponent from './search';
import MobileMenu from '../../MobileMenu/MobileMenu';
import { useMyContext } from '../../../context/MyContext';
import '../header.css';


const Header = (props) => {

    const { userId, logout } = useMyContext();
    const [userInfo, setUserInfo] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const SubmitHandler = (e) => {
        e.preventDefault()
    }

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const { carts } = props;

    const user = JSON.parse(localStorage.getItem('user'));

    const [isSticky, setIsSticky] = useState(false);

    const { cartData, showHeader } = useMyContext();

    const totalQuantity = cartData.length;

    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUserById(userId);
            if (res) setUserInfo(res);
        };
        if (userId) {
            fetchUser();
        }
    }, [userId]);

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

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        setUserInfo(null);
        logout();
        navigate("/");
        setShowDropdown(false);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleProfileClick = () => {
        navigate(`/user/profile/${userId}`);
        setShowDropdown(false);
    };

    return (
        <>
            {showHeader && (
                <header className={props.hclass}>
                    <HeaderTopbar />
                    <div id="header-sticky" className={isSticky ? 'sticky' : 'header-1'}>
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
                                                        {/* <ul className="submenu has-homemenu">
                                                            <li>
                                                                <div className="homemenu-items">
                                                                    <div className="homemenu">
                                                                        <div className="homemenu-thumb">
                                                                            <img src={Home1} alt="img" />
                                                                            <div className="demo-button">
                                                                                <Link onClick={ClickHandler} to="/home" className="theme-btn">
                                                                                    Demo Page
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                        <div className="homemenu-content text-center">
                                                                            <h4 className="homemenu-title">
                                                                                Home 01
                                                                            </h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className="homemenu">
                                                                        <div className="homemenu-thumb mb-15">
                                                                            <img src={Home2} alt="img" />
                                                                            <div className="demo-button">
                                                                                <Link onClick={ClickHandler} to="/home-2" className="theme-btn">
                                                                                    Demo Page
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                        <div className="homemenu-content text-center">
                                                                            <h4 className="homemenu-title">
                                                                                Home 02
                                                                            </h4>
                                                                        </div>
                                                                    </div>
                                                                    <div className="homemenu">
                                                                        <div className="homemenu-thumb mb-15">
                                                                            <img src={Home3} alt="img" />
                                                                            <div className="demo-button">
                                                                                <Link onClick={ClickHandler} to="/home-3" className="theme-btn">
                                                                                    Demo Page
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                        <div className="homemenu-content text-center">
                                                                            <h4 className="homemenu-title">
                                                                                Home 03
                                                                            </h4>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        </ul> */}
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to="/shop">Sản phẩm</Link>
                                                    </li>
                                                    <li className="has-dropdown active d-xl-none">
                                                        <Link onClick={ClickHandler} to="/team" className="border-none">
                                                            Home
                                                        </Link>
                                             <li>
 <Link onClick={ClickHandler} to="">
 Services
 </Link>
 <ul className="">
 <li><Link onClick={ClickHandler} to="">Services</Link></li>
 <li><Link onClick={ClickHandler} to="">Service details</Link></li>
 </ul>
 </li>r} to="/about">Về chúng tôi</Link>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to="/service-details/Sticker-printing">Dịch vụ</Link>
                                                    </li>
        <ul className="">
 <li><Link onClick={ClickHandler} to="">Projects</Link></li>
 <li><Link onClick={ClickHandler} to="">Project details</Link></li>
 <li><Link onClick={ClickHandler} to="">404 Page</Link></li>
 </ul>andler} to="/service">Dịch vụ</Link></li>
                                                            <li><Link onCli<li>
 <Link onClick={ClickHandler} to="">
 Shop
 </Link>
 <ul className="">
 <li><Link onClick={ClickHandler} to="">Shop</Link></li>
 <li><Link onClick={ClickHandler} to="">Shop details</Link></li>
 <li><Link onClick={ClickHandler} to="">Shopping cart</Link></li>
 <li><Link onClick={ClickHandler} to="">Checkout</Link></li>
 </ul>
 </li>                             <li><Link onClick={ClickHandler} to="/404">404 Page</Link></li>
                                                        </ul> */}
                                                    </li>
                                                    {/* <li>
                                                        <Link onClick={ClickHandler} to="#">
                                                            Cửa hàng
                                                        </Link>
                                                        <ul className="submenu">
                                                            <li><Link onClick={ClickHandler} to="/shop">Cửa hàng</Link></li>
                                                            <li><Link onClick={ClickHandler} to="/shop-details/Calendar-printing-design">Chi tiết cửa hàng</Link></li>
                                                            <li><Link onClick={ClickHandler} to="/shop-cart">Giỏ hàng</Link></li>
                                                            <li><Link onClick={ClickHandler} to="/checkout">Thanh toán</Link></li>
                                                        </ul>
                                                    </li> */}
                                                    <li>
                                                        <Link onClick={ClickHandler} to="#">
                                                            Tin tức
                                                        </Link>
                                                        <ul className="submenu">
                                                            <li><Link onClick={ClickHandler} to="/news">Tin tức</Link></li>
                                                            <li><Link onClick={ClickHandler} to="/blog-single/How-To-Teach-Kids-Ramadan-Isn't-About-Food">Chi tiết tin tức</Link></li>
                                                        </ul>
                                                    </li>
                                                    <li>
                                                        <Link onClick={ClickHandler} to="/contact">Liên hệ</Link>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                    <div className="header-right header-main-wrapper">
                                        <div className="header-right-section">
                                            <SearchComponent />
                                            {user && (
                                                <h5 className="cart-title">
                                                    <Link
                                                        onClick={ClickHandler}
                                                        to={`/shop-cart/${user?.userId}`}
                                                    >
                                                        <i className="fas fa-shopping-cart cart-icon"></i>
                                                        <span className="cart-text">Shopping cart</span>
                                                        <span className='cart-count'>{totalQuantity}</span>
                                                    </Link>
                                                </h5>
                                            )}
                                            <div
                                                ref={dropdownRef}
                                                className="user-dropdown-container"
                                            >
                                                {userInfo ? (
                                                    <>
                                                        <div
                                                            onClick={toggleDropdown}
                                                            className={`user-profile-toggle ${showDropdown ? 'active' : ''}`}
                                                        >
                                                            <Avatar
                                                                alt={userInfo?.name}
                                                                src={
                                                                    Array.isArray(userInfo.images) &&
                                                                        userInfo.images.length > 0 &&
                                                                        userInfo.images[0]
                                                                        ? userInfo.images[0]
                                                                        : avatarDefault
                                                                }
                                                                sx={{ width: 35, height: 35 }}
                                                            />
                                                            <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'} chevron-icon`}></i>
                                                        </div>

                                                        {showDropdown && (
                                                            <div className="user-dropdown-menu">
                                                                <div className="dropdown-header">
                                                                    <div className="user-info">
                                                                        <Avatar
                                                                            alt={userInfo?.name}
                                                                            src={
                                                                                Array.isArray(userInfo.images) &&
                                                                                    userInfo.images.length > 0 &&
                                                                                    userInfo.images[0]
                                                                                    ? userInfo.images[0]
                                                                                    : avatarDefault
                                                                            }
                                                                            sx={{ width: 40, height: 40 }}
                                                                        />
                                                                        <div className="user-details">
                                                                            <h4 className="user-name">{userInfo?.name}</h4>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="dropdown-body">
                                                                    <div
                                                                        onClick={handleProfileClick}
                                                                        className="menu-item"
                                                                    >
                                                                        <i className="fas fa-user menu-icon"></i>
                                                                        Thông tin cá nhân
                                                                    </div>

                                                                    <div
                                                                        onClick={() => navigate(`/user/orders/${userId}`)}
                                                                        className="menu-item"
                                                                    >
                                                                        <i className="fas fa-shopping-bag menu-icon"></i>My orders</div>

                                                                    <div
                                                                        onClick={() => navigate("/user/address")}
                                                                        className="menu-item"
                                                                    >
                                                                        <i className="fas fa-map-marker-alt menu-icon"></i>Address</div>

                                                                    <hr className="menu-separator" />

                                                                    <div
                                                                        onClick={handleLogout}
                                                                        className="menu-item logout"
                                                                    >
                                                                        <i className="fas fa-sign-out-alt menu-icon"></i>Log out</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div
                                                        onClick={() => navigate("/login")}
                                                        className="login-button"
                                                    >
                                                        <i className="fas fa-user login-icon"></i>Log in</div>
                                                )}
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
                    </div>
                </header>
            )}
        </>
    )
}
const mapStateToProps = (state) => {
    return {
        carts: state.cartList.cart,
    };
};


// export default connect(mapStateToProps, { removeFromCart })(Header);









export { Header as InkMeHeader };
