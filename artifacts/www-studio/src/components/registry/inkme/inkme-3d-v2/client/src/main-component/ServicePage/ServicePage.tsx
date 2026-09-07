import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import ServiceSection from '../../components/ServicePages/ServiceSection/ServiceSection';
import FunFact from '../../components/FunFact/FunFact';
import ServiceSectionS4 from '../../components/ServicePages/ServiceSectionS4/ServiceSectionS4';
import WorksSection from '../../components/WorksSection/WorksSection';
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';

const ServicePage = () => {
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'3D printing services'} pagesub={'Services'} />
            <ServiceSection hclass={'service-section section-padding section-bg-2 fix pb-0'} />
            {/* <FunFact hclass={'counter-section fix section-padding'} /> */}
            <ServiceSectionS4 />
            <WorksSection hclass={'about-feature-sections fix section-padding section-bg-2 pb-0'} eclass={'about-feature-wrapper'} />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default ServicePage;
export { ServicePage as InkMeServicePage };
