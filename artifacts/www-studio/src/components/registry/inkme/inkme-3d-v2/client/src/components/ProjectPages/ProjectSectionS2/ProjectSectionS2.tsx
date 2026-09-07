import React from 'react';
import { Link } from 'react-router-dom';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Project from "../../../api/Portfolio";

const ProjectSectionS2 = (props) => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    };
    const { ShowSectionTitle = true } = props
    return (
        <section className={"" + props.hclass}>
            {ShowSectionTitle && (
                <div className="container">
                    <div className="section-title-area">
                        <div className="section-title">
                            <h6 className="wow fadeInUp">Digital printing Service</h6>
                            <h2 className="wow fadeInUp" data-wow-delay=".3s">
                                Our Popular Print Service <br />
                                Complete Solution
                            </h2>
                        </div>
                        <Link onClick={ClickHandler} to="/about" className="theme-btn wow fadeInUp" data-wow-delay=".5s">
                            more about us
                        </Link>
                    </div>
                </div>
            )}
            <div className="container-fluid">
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                    <Masonry>
                        {Project.slice(4, 12).map((project, item) => (
                            <div className="item" key={item}>
                                <div className="project-image">
                                    <img src={project.pimg1} alt={project.title} style={{ width: '100%', display: 'block' }} />
                                    <div className="portfolio-content">
                                        <h3>
                                            <Link onClick={ClickHandler} to={`/project-details/${project.slug}`}>
                                                {project.title}
                                            </Link>
                                        </h3>
                                        <h4>AI</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Masonry>
                </ResponsiveMasonry>
            </div>
        </section>
    );
};

// export default ProjectSectionS2;
export { ProjectSectionS2 as InkMeProjectSectionS2 };
