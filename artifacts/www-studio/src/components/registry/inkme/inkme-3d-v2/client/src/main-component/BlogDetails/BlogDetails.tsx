import * as React from 'react';
import { useParams } from 'react-router-dom'
import blogs from '../../api/blogs'
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import BlogSingle from '../../components/BlogPages/BlogDetails/BlogSingle'
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';


const BlogDetails = () => {

    const { slug } = useParams()

    const BlogDetails = blogs.find(item => item.slug === slug)

    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'Digital printing Service'} pagesub={BlogDetails.title} />
            <BlogSingle />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default BlogDetails;
export { BlogDetails as InkMeBlogDetails };
