import React from 'react';
import { Link } from 'react-router-dom';

const HeaderTopbarS3 = () => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }
    return (
        <div className="header-top-3">
            <div className="container-fluid">
                <div className="header-top-wrapper style-3">
                    <p><Link onClick={ClickHandler} to="del:+41888567890">(+41)-888-56-7890</Link>  (Mon - Sat 9am to 6pm)</p>
                    <p> 🔥 Free shipping on all U.S. orders $50+</p>
                    <div className="header-top-right">
                        <div className="social-icon d-flex align-items-center">
                            <Link onClick={ClickHandler} to="#"><i className="fab fa-facebook-f"></i></Link>
                            <Link onClick={ClickHandler} to="#"><i className="fab fa-twitter"></i></Link>
                            <Link onClick={ClickHandler} to="#"><i className="fab fa-instagram"></i></Link>
                            <Link onClick={ClickHandler} to="#"><i className="fab fa-pinterest-p"></i></Link>
                        </div>
                        <div className="nice-items">
                            <select className='nice-select'>
                                <option>USD</option>
                                <option>EURO</option>
                                <option>CNY</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default HeaderTopbarS3;
export { HeaderTopbarS3 as InkMeHeaderTopbarS3 };
