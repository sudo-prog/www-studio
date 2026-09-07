import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from "../../components/pagetitle/PageTitle";
import CheckoutSection from '../../components/CheckoutPages/CheckoutSection'
import { connect } from "react-redux";
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';


const CheckoutPage = ({ cartList }) => {
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'InkMe - Cửa hàng in ấn'} pagesub={'Thanh Toán'} />
            <CheckoutSection cartList={cartList} />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
const mapStateToProps = state => {
    return {
        cartList: state.cartList.cart,
        symbol: state.data.symbol
    }
};

// export default connect(mapStateToProps)(CheckoutPage);
export { CheckoutPage as InkMeCheckoutPage };
