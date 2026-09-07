import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Contactpage from '../../components/ContactPages/Contactpage/Contactpage'
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';


const ContactPage = () => {
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'Contact us'} pagesub={'Contact'} />
            <Contactpage />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default ContactPage;

export { ContactPage as InkMeContactPage };
