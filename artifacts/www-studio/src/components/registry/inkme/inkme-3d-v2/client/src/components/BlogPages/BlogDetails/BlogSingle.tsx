import React from 'react';
import { Link } from 'react-router-dom'
import blog3 from '../../../img/news/post-5.jpg'
import blog4 from '../../../img/news/post-6.jpg'
import blog5 from '../../../img/news/post-7.jpg'

import blog6 from '../../../img/news/comment.png'
import gl1 from '../../../img/news/comment-2.png'
import blogs from '../../../api/blogs';
import { useParams } from 'react-router-dom'
import BlogSidebar from '../BlogSidebar/BlogSidebar'
import ContactForm from './Contact';

const BlogSingle = (props) => {

    const { slug } = useParams()

    const BlogDetails = blogs.find(item => item.slug === slug)

    const submitHandler = (e) => {
        e.preventDefault()
    }

    return (
        <section className="news-section-3 section-padding section-bg-2">
            <div className="container">
                <div className="news-details-wrapper">
                    <div className="row g-5">
                        <div className="col-12 col-lg-8">
                            <div className="single-news-post">
                                <div className="details-image">
                                    <img src={BlogDetails.blogSingleImg} alt="img" />
                                </div>
                                <div className="details-content">
                                    <div className="post-meta">
                                        <span><i className="fa-regular fa-user"></i>Shikhon .Ha</span>
                                        <span><i className="fa-regular fa-comments"></i>35 Comments</span>
                                        <span><i className="fal fa-calendar-alt"></i>24th March 2024</span>
                                    </div>
                                    <h3 className="wow fadeInUp" data-wow-delay=".3s">
                                        {BlogDetails.title}
                                    </h3>
                                    <p className="mb-4">
                                        he whimsically named Egg Canvas is the brainchild of Erica Choi, a design director and photo
                                        grapher based in York. Why the name “Egg Canvas Erica was inspired by her Korean childhood
                                        nickname, which means egg, while “canvas” medium with wh art is created. “Egg Canvas
                                        therefore, is her life—creating beautiful things each day
                                        a blank canvas.
                                    </p>
                                    <p className="mb-4">
                                        We have covered many special events such as fireworks, fairs, parades, races, walks, awards ceremonies, fashion shows, sporting events, and even a memorial service.
                                    </p>
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vulputate vestibulum rhon
                                        cus, dolor eget viverra pretium, dolor tellus aliquet nunc, vitae ultricies erat elit eu lacus. Vestibulum non justo fun consectetur, cursus ante, tincidunt sapien. Nulla quis diam sit amet turpis interd enim. Vivamus fauc ex sed nibh egestas elementum. Mauris et bibendum
                                    </p>
                                    <div className="hilight-text mt-5 mb-5">
                                        <p>
                                            Your time is limited, so don’t waste it living someone else’s
                                            life.Don’t be trapped by dogma – which is living with the
                                        </p>
                                        <h6>Shikhon Islam</h6>
                                        <svg  width="37" height="29" viewBox="0 0 37 29" fill="none">
                                            <path d="M0.371614 16.9331L8.25558 17.0471L2.84366 28.2597L10.7276 28.3738L16.1396 17.1612L16.3734 0.228178L0.605469 0L0.371614 16.9331Z" fill="#08BDC9" />
                                            <path d="M20.6484 0.248047L20.4146 17.1811L28.2986 17.2952L22.8866 28.5078L30.7706 28.6219L36.1825 17.4093L36.4164 0.476225L20.6484 0.248047Z" fill="#08BDC9" />
                                        </svg>
                                    </div>
                                    <h4 className="wow fadeInUp" data-wow-delay=".3s">Let Our Investment Management Team</h4>
                                    <div className="row g-4 mt-2 justify-content-between align-items-center">
                                        <div className="col-xl-6 col-lg-6">
                                            <ul className="details-list">
                                                <li>
                                                    <i className="fa-regular fa-circle-check"></i>
                                                    Lorem Ipsum generators on the tend to repeat.
                                                </li>
                                                <li>
                                                    <i className="fa-regular fa-circle-check"></i>
                                                    If you are going to use a passage.
                                                </li>
                                                <li>
                                                    <i className="fa-regular fa-circle-check"></i>
                                                    Lorem Ipsum generators on the tend to repeat.
                                                </li>
                                                <li>
                                                    <i className="fa-regular fa-circle-check"></i>
                                                    Lorem Ipsum generators on the tend to repeat.
                                                </li>
                                                <li>
                                                    <i className="fa-regular fa-circle-check"></i>
                                                    If you are going to use a passage.
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="col-xl-5 col-lg-6">
                                            <div className="post-thumb">
                                                <img src={blog3} alt="img" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row g-4 mt-4 mb-4">
                                        <div className="col-lg-6">
                                            <div className="post-thumb">
                                                <img src={blog4} alt="img" />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="post-thumb">
                                                <img src={blog5} alt="img" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="pt-2">
                                        We have covered many special events such as fireworks, fairs, parades, races, walks, awards
                                        ceremonies, fashion shows, sporting events, and even a memorial service.Lorem ipsum dolor
                                        sit amet, consectetur adipiscing elit. vestibulum rhoncus, dolor eget viverra pretium, dolor
                                        ellus aliquet nunc,
                                    </p>
                                </div>
                            </div>
                            <div className="row tag-share-wrap mt-4 mb-5">
                                <div className="col-lg-8 col-12">
                                    <div className="tagcloud">
                                        <span>Tags:</span>
                                        <Link to="#">Business</Link>
                                        <Link to="#">Design</Link>
                                        <Link to="#">apps</Link>
                                        <Link to="#">data</Link>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-12 mt-3 mt-lg-0 text-lg-end">
                                    <div className="social-share">
                                        <span className="me-3">Share:</span>
                                        <Link to="#"><i className="fab fa-facebook-f"></i></Link>
                                        <Link to="#"><i className="fab fa-twitter"></i></Link>
                                        <Link to="#"><i className="fab fa-linkedin-in"></i></Link>
                                        <Link to="#"><i className="fab fa-youtube"></i></Link>
                                    </div>
                                </div>
                            </div>
                            <div className="comments-area">
                                <div className="comments-heading">
                                    <h3>(02) Comment</h3>
                                </div>
                                <div className="blog-single-comment d-flex gap-4 pt-4">
                                    <div className="image">
                                        <img src={blog6} alt="image" />
                                    </div>
                                    <div className="content">
                                        <div className="head d-flex flex-wrap gap-2 align-items-center justify-content-between">
                                            <div className="con">
                                                <h5><Link to="#">Rohan De Spond</Link></h5>
                                                <span>25 january 2024</span>
                                            </div>
                                            <Link to="#" className="reply"><i className="fa-regular fa-reply-all"></i></Link>
                                        </div>
                                        <p className="mt-2 mb-4">Neque porro est qui dolorem ipsum quia quaed inventor
                                            There are many variations of passages of Lorem Ipsum available, but the leap into electronic
                                            type setting, remaining essentiallyuncha opularisedthe with the release of Letrasetsheets
                                            containingth leap electrtypesetting remainingmajority have. There are many variations
                                            of passages of Lorem Ipsum
                                        </p>
                                    </div>
                                </div>
                                <div className="blog-single-comment style-2 d-flex gap-4 pt-4">
                                    <div className="image">
                                        <img src={gl1} alt="image" />
                                    </div>
                                    <div className="content">
                                        <div className="head d-flex flex-wrap gap-2 align-items-center justify-content-between">
                                            <div className="con">
                                                <h5><Link to="#">Johan Ritaxon</Link></h5>
                                                <span>25 january 2024</span>
                                            </div>
                                            <Link to="#" className="reply"><i className="fa-regular fa-reply-all"></i></Link>
                                        </div>
                                        <p className="mt-2 mb-4">Neque porro est qui dolorem ipsum quia quaed inventor
                                            There are many variations of passages of Lorem Ipsum available, but the
                                            majority have. There are many variations of passages
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="comment-form-wrap pt-5">
                                <h3>Write your comment</h3>
                                <ContactForm />
                            </div>
                        </div>
                        <div className="col-12 col-lg-4">
                            <BlogSidebar/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )

}

// export default BlogSingle;
export { BlogSingle as InkMeBlogSingle };
