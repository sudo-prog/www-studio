import React from 'react';
import { Link } from 'react-router-dom'
import BlogSidebar from '../BlogSidebar/BlogSidebar'

import blogs from '../../../api/blogs'


const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const BlogList = (props) => {
    return (

        <section className="news-section-3 section-padding section-bg-2">
            <div className="container">
                <div className="news-standard-wrapper">
                    <div className="row g-5">
                        <div className="col-12 col-lg-8">
                            {blogs.slice(0, 3).map((blog, bitem) => (
                                <div className="news-standard-items" key={bitem}>
                                    <div className="news-thumb">
                                        <img src={blog.screens} alt="img" />
                                        <div className="post-cat">
                                            {blog.day} <br />
                                            Feb
                                        </div>
                                    </div>
                                    <div className="news-content">
                                        <div className="post-meta">
                                            <span><i className="fa-regular fa-user"></i>Shikhon .Ha</span>
                                            <span><i className="fa-regular fa-comments"></i>35 Comments</span>
                                            <span><i className="fal fa-calendar-alt"></i>24th March 2024</span>
                                        </div>
                                        <h3>
                                            <Link onClick={ClickHandler} to={`/blog-single/${blog.slug}`}>{blog.title}</Link>
                                        </h3>
                                        <p>
                                            {blog.description}
                                        </p>
                                        <Link onClick={ClickHandler} to={`/blog-single/${blog.slug}`} className="link-btns">Read More <i className="fa-sharp fa-regular fa-arrow-right-long"></i></Link>
                                    </div>
                                </div>
                            ))}

                            <div className="page-nav-wrap mt-5 text-center">
                                <ul>
                                    <li><a className="page-numbers" href="#"><i className="fa-solid fa-chevrons-left"></i></a></li>
                                    <li><a className="page-numbers" href="#">1</a></li>
                                    <li><a className="page-numbers" href="#">2</a></li>
                                    <li><a className="page-numbers" href="#">3</a></li>
                                    <li><a className="page-numbers" href="#"><i className="fa-solid fa-chevrons-right"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-12 col-lg-4">
                            <BlogSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )

}

// export default BlogList;



export { BlogList as InkMeBlogList };
