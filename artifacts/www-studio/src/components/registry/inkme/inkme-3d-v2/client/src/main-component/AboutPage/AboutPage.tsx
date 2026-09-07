import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import About2 from '../../components/AboutPages/about2/about2';
import MarqueeSection from '../../components/MarqueePages/MarqueeSection/MarqueeSection';
import ServiceSection from '../../components/ServicePages/ServiceSection/ServiceSection';
import FunFact from '../../components/FunFact/FunFact';
import WorksSection from '../../components/WorksSection/WorksSection';
import CtaVideoSection from '../../components/CtaPages/CtaVideoSection/CtaVideoSection';
import ProcessSectionS2 from '../../components/ProcessPages/ProcessSectionS2/ProcessSectionS2';
import TestimonialSectionS3 from '../../components/TestimonialPages/TestimonialSectionS3/TestimonialSectionS3';
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';

import ServiceBg from '../../img/service/service-bg.jpg'
const AboutPage = () => {
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'3D printing services'} pagesub={'InkMe'} />
            <About2 hclass={'about-section section-padding'} />
            <MarqueeSection hclass={'marquee-section'} />
            <ServiceSection hclass={'service-section bg-cover section-padding'} Bg={ServiceBg} />
            {/* <FunFact hclass={'counter-section fix section-padding'} /> */}
            <WorksSection hclass={'about-feature-section fix section-padding pt-0 bg-cover'} eclass={'about-feature-wrapper style-2'} />
            <CtaVideoSection />
            <ProcessSectionS2 />
            {/* <TestimonialSectionS3 /> */}
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default AboutPage;
export { AboutPage as InkMeAboutPage };
