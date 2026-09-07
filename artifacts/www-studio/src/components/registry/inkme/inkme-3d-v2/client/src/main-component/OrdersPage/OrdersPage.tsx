import React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle';
import OrdersList from './OrdersList/OrdersList';
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';
import './OrdersPage.css';

const OrdersPage = () => {
    return (
        <>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'InkMe - 3D Printing'} pagesub={'My order'} />
            <div className="orders-page-wrapper">
                <div className="container-fluid">
                    <OrdersList />
                </div>
            </div>
            <CtaSectionS2 />
            <FooterS3 />
        </>
    );
};

// export default OrdersPage; 
export { OrdersPage as InkMeOrdersPage };
