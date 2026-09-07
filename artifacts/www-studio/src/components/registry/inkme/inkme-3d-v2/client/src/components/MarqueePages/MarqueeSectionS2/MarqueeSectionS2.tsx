import React from 'react';

import Box from '../../../img/marquee-box-2.png'

const MarqueeSectionS2 = () => {
    return (
        <div className="marquee-section fix mb-80 margin-top-8">
            <div className="mycustom-marque">
                <div className="scrolling-wrap">
                    <div className="comm cmn-style-2">
                        <div className="cmn-textslide">Design.</div>
                        <div className="cmn-textslide"> Brand.</div>
                        <div className="cmn-textslide color-2">Quality</div>
                        <div><img src={Box} alt="img" /></div>
                    </div>
                    <div className="comm cmn-style-2">
                        <div className="cmn-textslide">Design.</div>
                        <div className="cmn-textslide"> Brand.</div>
                        <div className="cmn-textslide color-2">Quality</div>
                        <div><img src={Box} alt="img" /></div>
                    </div>
                    <div className="comm cmn-style-2">
                        <div className="cmn-textslide">Design.</div>
                        <div className="cmn-textslide"> Brand.</div>
                        <div className="cmn-textslide color-2">Quality</div>
                        <div><img src={Box} alt="img" /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default MarqueeSectionS2;
export { MarqueeSectionS2 as InkMeMarqueeSectionS2 };
