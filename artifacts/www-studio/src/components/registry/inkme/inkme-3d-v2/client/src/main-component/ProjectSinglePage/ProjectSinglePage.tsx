import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import Projact from '../../api/Portfolio'
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';


import P1 from '../../img/project/details.jpg'
import P2 from '../../img/project/details-2.jpg'
import P3 from '../../img/project/details-3.jpg'
import P4 from '../../img/project/details-4.jpg'

const ProjectSinglePage = () => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    };

    const { slug } = useParams();

    const ProjactDetailPage = Projact.find(item => item.slug === slug)
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'Digital printing Service'} pagesub={ProjactDetailPage.title} />
            <section className="project-details fix section-padding section-bg-2">
                <div className="container">
                    <div className="project-details-wrapper">
                        <div className="row g-4 justify-content-between align-items-center">
                            <div className="col-lg-7">
                                <div className="project-title-content">
                                    <h6 className="text split-text right">About The Project</h6>
                                    <h2>
                                        {ProjactDetailPage.title}
                                    </h2>
                                    <p>
                                        Sed ut perspiciatis unde omniste natus voluptatem accusantiume rem  aperia eaque ipsa
                                        quae abillo inventore veritatis quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                                        epsam voluptatem quia voluptas aspernatur odites sed quia consequunture
                                    </p>
                                    <Link onClick={ClickHandler} to="#" className="theme-btn">
                                        <span>
                                            Visit Website
                                            <i className="fas fa-chevron-right"></i>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                            <div className="col-lg-3">
                                <div className="details-info">
                                    <div className="info-items mb-4">
                                        <h5>Clients</h5>
                                        <p>Design Studio In USA</p>
                                    </div>
                                    <div className="info-items mb-4">
                                        <h5>Project Type</h5>
                                        <p>Digital Product Design</p>
                                    </div>
                                    <div className="info-items mb-4">
                                        <h5>Date</h5>
                                        <p>25 October 2024</p>
                                    </div>
                                    <div className="info-items">
                                        <h5>Website</h5>
                                        <Link onClick={ClickHandler} to="#">wiatech.com</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="project-details-image">
                            <div className="row g-4">
                                <div className="col-lg-4">
                                    <div className="details-image">
                                        <img src={ProjactDetailPage.pS1img} alt="img" />
                                    </div>
                                </div>
                                <div className="col-lg-8">
                                    <div className="details-image">
                                        <img src={ProjactDetailPage.pS2img} alt="img" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="project-details-content">
                            <div className="row">
                                <div className="col-lg-4">
                                    <div className="title-content">
                                        <h2>
                                            Interesting Facts In
                                            Development
                                        </h2>
                                    </div>
                                </div>
                                <div className="col-lg-1"></div>
                                <div className="col-lg-6">
                                    <div className="details-content">
                                        <p>
                                            Must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter
                                        </p>
                                        <div className="list-items">
                                            <ul>
                                                <li>
                                                    <i className="far fa-check"></i>
                                                    Efficient Sprint Planning
                                                </li>
                                                <li>
                                                    <i className="far fa-check"></i>
                                                    Standups and Demos
                                                </li>
                                            </ul>
                                            <ul>
                                                <li>
                                                    <i className="far fa-check"></i>
                                                    Iterative Delivery Approach
                                                </li>
                                                <li>
                                                    <i className="far fa-check"></i>
                                                    Problem-solving
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="project-details-content style-2">
                            <div className="row">
                                <div className="col-lg-4">
                                    <div className="title-content">
                                        <h2>
                                            The Results of <br />
                                            Our Project
                                        </h2>
                                    </div>
                                </div>
                                <div className="col-lg-1"></div>
                                <div className="col-lg-6">
                                    <div className="details-content">
                                        <p>
                                            Will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness rejects, dislikes, or avoids pleasure
                                        </p>
                                        <div className="list-items-area">
                                            <div className="icon">
                                                <i className="fas fa-check-circle"></i>
                                                Support clients
                                            </div>
                                            <p>
                                                Sed ut perspiciatis unde omnis natus voluptatem accusantium
                                                doloremque laudantium, totam rem aperiam inventore
                                            </p>
                                        </div>
                                        <div className="list-items-area">
                                            <div className="icon">
                                                <i className="fas fa-check-circle"></i>
                                                Solve problems
                                            </div>
                                            <p>
                                                To take a trivial example, which of us ever undertakes laborious
                                                physical exercise, except to obtain some advantage
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="project-details-image mt-0">
                            <div className="row g-4">
                                <div className="col-lg-6">
                                    <img src={P3} alt="img" />
                                </div>
                                <div className="col-lg-6">
                                    <img src={P4} alt="img" />
                                </div>
                            </div>
                        </div>
                        <div className="previous-button">
                            <div className="preview-button">
                                <span>Preview<i className="fas fa-chevron-right"></i></span>
                                <h4>
                                    <Link onClick={ClickHandler} to="#">Business Website Design</Link>
                                </h4>
                            </div>
                            <div className="icon">
                                <i className="fas fa-th"></i>
                            </div>
                            <div className="preview-button style-2">
                                <span>Next<i className="fas fa-chevron-right"></i></span>
                                <h4>
                                    <Link onClick={ClickHandler} to="#">Mobile Application Design</Link>
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    );
};

// export default ProjectSinglePage;
export { ProjectSinglePage as InkMeProjectSinglePage };
