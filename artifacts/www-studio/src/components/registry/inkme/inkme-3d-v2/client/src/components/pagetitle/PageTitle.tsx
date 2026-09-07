import React from 'react'

import BreadcrumbBG from '../../img/breadcrumb-bg.jpg'
import BShap1 from '../../img/flower-shape.png'
import BShap2 from '../../img/star-shape.png'

const PageTitle = (props) => {
    return (
        <div className="breadcrumb-section section-bg-2">
            <div className="container-fluid">
                <div className="breadcrumb-wrapper bg-cover" style={{ backgroundImage: `url(${BreadcrumbBG})`}}>
                    <div className="flower-shape">
                        <img src={BShap1} alt="img" />
                    </div>
                    <div className="star-shape">
                        <img src={BShap2} alt="img" />
                    </div>
                    <div className="container">
                        <div className="page-heading center">
                            <h6>{props.pageTitle}</h6>
                            <h1>{props.pagesub}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// export default PageTitle;


export { PageTitle as InkMePageTitle };
