import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';

import ProjectSectionS2 from '../../components/ProjectPages/ProjectSectionS2/ProjectSectionS2';
const ProjectPage = () => {
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'Digital printing Service'} pagesub={'Project Details'} />
            <ProjectSectionS2 hclass={'project-section s2 fix section-padding '} ShowSectionTitle={false} />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default ProjectPage;
export { ProjectPage as InkMeProjectPage };
