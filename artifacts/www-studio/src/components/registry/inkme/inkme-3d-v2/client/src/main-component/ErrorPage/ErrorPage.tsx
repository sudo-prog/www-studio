import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Error from '../../components/404/404'
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';

const ErrorPage = () => {
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'Digital printing Service'} pagesub={'Error Page'} />
            <Error />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default ErrorPage;



export { ErrorPage as InkMeErrorPage };
