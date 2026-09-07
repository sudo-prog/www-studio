import React from 'react';

import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const HeaderTopbarS2 = () => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    const user = JSON.parse(localStorage.getItem('user'));

    const checkLogin = () => {
        if (user) {
            return <Link onClick={ClickHandler} to={`/user/orders/${user?.userId}`}>
                <i className="fas fa-truck"></i>Track order</Link>
        }
        return <Link onClick={ClickHandler} to="/login">
            <i className="fas fa-truck"></i>Track order</Link>
    }

    return (
        <div className="container-fluid">
            <div className="header-top-wrapper-2">
                <div className="coming-soon">
                    <h5>Super offer 30%</h5>
                    <CountdownTimer />
                    <Link onClick={ClickHandler} to="/shop" className="theme-btn"> Mua sắm ngay</Link>
                </div>
                <div className="header-top-right-2">
                    <h6>{checkLogin()}</h6>
                    <div className="social-icon d-flex align-items-center">
                        <Link onClick={ClickHandler} to="https://www.facebook.com/profile.php?id=61576817460928" target='_blank'><i className="fab fa-facebook-f"></i></Link>
                        <Link onClick={ClickHandler} to="https://vn.shp.ee/zP7E4cR" target='_blank'><i className="fa-brands fa-stripe-s"></i></Link>
                        <Link onClick={ClickHandler} to="https://www.tiktok.com/@inkmestore?_t=ZS-8x8pnvioux7&_r=1" target='_blank'><i className="fa-brands fa-tiktok"></i></Link>
                        <Link onClick={ClickHandler} to="#" target='_blank'><i className="fa-brands fa-youtube"></i></Link>
                    </div>
                    <div className="flag-wrap">
                        <select className='nice-select'>
                            <option>Vietnamese</option>
                            <option>English</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default HeaderTopbarS2;
export { HeaderTopbarS2 as InkMeHeaderTopbarS2 };
