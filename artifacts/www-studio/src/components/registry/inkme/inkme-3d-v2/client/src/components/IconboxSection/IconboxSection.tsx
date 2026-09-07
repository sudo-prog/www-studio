import React from 'react';

import Fis1 from '../../img/icon/04.svg'
import Fis2 from '../../img/icon/05.svg'
import Fis3 from '../../img/icon/06.svg'
import Fis4 from '../../img/icon/07.svg'
import Fis5 from '../../img/icon/06.svg'

const IconboxSection = () => {
    return (
        <div className="feature-icon-box-section">
            <div className="container-fluid">
                <div className="feature-box-wrapper">
                    <div className="icon-box-items">
                        <div className="icon">
                            <img src={Fis1} alt="img" />
                        </div>
                        <p>NO Die & plate charges</p>
                    </div>
                    <div className="icon-box-items">
                        <div className="icon">
                            <img src={Fis2} alt="img" />
                        </div>
                        <p>High quality offset printing</p>
                    </div>
                    <div className="icon-box-items">
                        <div className="icon">
                            <img src={Fis3} alt="img" />
                        </div>
                        <p>Low minimum order quantity</p>
                    </div>
                    <div className="icon-box-items">
                        <div className="icon">
                            <img src={Fis4} alt="img" />
                        </div>
                        <p>1000+ Product available</p>
                    </div>
                    <div className="icon-box-items">
                        <div className="icon">
                            <img src={Fis5} alt="img" />
                        </div>
                        <p>Free delivery for first order</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default IconboxSection;
export { IconboxSection as InkMeIconboxSection };
