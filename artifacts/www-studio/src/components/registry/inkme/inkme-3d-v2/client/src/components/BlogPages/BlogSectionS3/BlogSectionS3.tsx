import React from "react";
import blogs from '../../../api/blogs'
import { Link } from "react-router-dom";


const ClickHandler = () => {
    window.scrollTo(10, 0);
}


const BlogSectionS3 = (props) => {
    const { blogAllbtn = true } = props
    return (
        <section className="blog-section-3 section-padding">
            <div className="container">
                <div className="section-title text-center">
                    <h6 className="bg-5">Digital printing Service</h6>
                    <h2>
                        Get Update News & Blogs<br />
                        By Company
                    </h2>
                </div>
                <div className="row">
                    {blogs.map((blog, bl) => (
                        <div className="col-xl-4 col-lg-6 col-md-6 wow img-custom-anim-top" key={bl}>
                            <div className="blog-box-items">
                                <div className="blog-image">
                                    <img src={blog.screens} alt="img" />
                                    <img src={blog.screens} alt="img" />
                                </div>
                                <div className="blog-content">
                                    <span>e-Learning</span>
                                    <h3>
                                        <Link onClick={ClickHandler} to={`/blog-single/${blog.slug}`}>{blog.title}</Link>
                                    </h3>
                                    <ul className="blog-meta">
                                        <li>
                                            <i className="fa-regular fa-user"></i>
                                            Roger J. Spaulding
                                        </li>
                                        <li>
                                            <i className="fa-regular fa-comment"></i>
                                            Comments (5)
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {blogAllbtn && (
                    <div className="news-button text-center mt-5 wow fadeInUp" data-wow-delay=".3s">
                        <Link onClick={ClickHandler} to="/news" className="theme-btn">See all News</Link>
                    </div>
                )}
            </div>
        </section>
    );
}

// export default BlogSectionS3;










export { BlogSectionS3 as InkMeBlogSectionS3 };
