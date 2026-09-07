import * as React from 'react';
import PageTitle from '../../components/pagetitle/PageTitle'
import BlogList from '../../components/BlogPages/BlogList/BlogList'
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';

const BlogPage = () => {
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'Digital printing Service'} pagesub={'Blog Page'} />
            <BlogList />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default BlogPage;

export { BlogPage as InkMeBlogPage };
