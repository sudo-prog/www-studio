import * as React from 'react';
import { Link } from 'react-router-dom';
import Project from "../../../api/Portfolio";
import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.min.css';

const ProjectSectionS3 = () => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    };

    useEffect(() => {
        const projectSlider = new Swiper(".project-slider", {
            spaceBetween: 0,
            speed: 2000,
            loop: true,
            centeredSlides: true,
            navigation: {
                nextEl: ".array-prev",
                prevEl: ".array-next",
            },
            breakpoints: {
                1399: {
                    slidesPerView: 3,
                },
                1199: {
                    slidesPerView: 2,
                },
                991: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 2,
                },
                575: {
                    slidesPerView: 1,
                },
                0: {
                    slidesPerView: 1,
                },
            },
        });
    }, []);


    return (
        <section className="project-section-2 fix pt-0">
            <div className="project-wrapper-3">
                <div className="array-button">
                    <button className="array-prev"><i className="fa-regular fa-chevron-right"></i></button>
                    <button className="array-next"><i className="fa-regular fa-chevron-left"></i></button>
                </div>
                <div className="swiper project-slider">
                    <div className="swiper-wrapper">
                        {Project.slice(12, 16).map((project, item) => (
                            <div className="swiper-slide" key={item}>
                                <div className="project-thumb">
                                    <img src={project.pimg1} alt="img" />
                                    <div className="project-button">
                                        <Link onClick={ClickHandler} to={`/project-details/${project.slug}`} className="btns">
                                            View More
                                            <i className="fa-solid fa-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default ProjectSectionS3;
export { ProjectSectionS3 as InkMeProjectSectionS3 };
