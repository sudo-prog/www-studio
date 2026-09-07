import * as React from 'react';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import { useParams } from 'react-router-dom'
import VideoModal from '../../components/ModalVideo/VideoModal';
import Services from '../../api/Services';
import ServiceSidebar from './sidebar'
import Accordion from '../../components/Accordion/Accordion'
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';

import Video from '../../img/service/details-2.jpg'
import simg1 from '../../img/service/details-3.jpg'
import simg2 from '../../img/service/details-4.jpg'
import simg3 from '../../img/service/details-5.jpg'
import simg4 from '../../img/service/details-6.jpg'

const ServiceSinglePage = (props) => {
    const { slug } = useParams()

    const serviceDetails = Services.find(item => item.slug === slug)

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }
    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'Digital printing Service'} pagesub={serviceDetails.title} />
            <section className="service-details-section fix section-padding section-bg-2">
                <div className="container">
                    <div className="service-details-wrapper">
                        <div className="row g-5">
                            <div className="col-lg-4 order-2 order-md-1">
                                <ServiceSidebar />
                            </div>
                            <div className="col-lg-8 order-1 order-md-2">
                                <div className="service-details-image">
                                    <img src={serviceDetails.sSImg} alt="img" />
                                </div>
                                <div className="service-details-content">
                                    <h3>{serviceDetails.title}</h3>
                                    <p className="mt-3">
                                        InkMe mang đến giải pháp thiết kế áo 3D hiện đại, cho phép người dùng cá nhân hóa sản phẩm theo phong cách riêng.
                                        Với công nghệ mô hình hóa và giao diện đơn giản, việc tạo ra một thiết kế mang dấu ấn cá nhân chưa bao giờ dễ dàng đến thế.
                                    </p>

                                    <h3 className="mt-5 split-text right">Why is personalized design important?</h3>
                                    <p className="mt-3">
                                        Trong thời đại mà ai cũng muốn thể hiện cái tôi riêng biệt, việc sở hữu một chiếc áo mang dấu ấn cá nhân giúp tạo ấn tượng mạnh mẽ, từ đó tăng sự tự tin và kết nối cộng đồng.
                                        InkMe cho phép bạn "Wear" ý tưởng của chính mình – từ cá nhân, đội nhóm cho đến doanh nghiệp.
                                    </p>

                                    <div className="service-details-video">
                                        <div className="row g-4 align-items-center">
                                            <div className="col-lg-6">
                                                <div className="video-image">
                                                    <img src={Video} alt="video demo" />
                                                    <div className="video-box">
                                                        <VideoModal />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="details-video-content">
                                                    <h3 className="mb-3 split-text right">Why use InkMe?</h3>
                                                    <p>
                                                        InkMe không chỉ là một công cụ thiết kế – mà còn là nền tảng sáng tạo mở, hỗ trợ mọi người hiện thực hóa ý tưởng một cách trực quan nhất.
                                                    </p>
                                                    <ul>
                                                        <li>
                                                            <i className="fa-solid fa-circle-check"></i>Realistic 3D product preview before printing</li>
                                                        <li>
                                                            <i className="fa-solid fa-circle-check"></i>Personalize the entire design – colors, images, text</li>
                                                        <li>
                                                            <i className="fa-solid fa-circle-check"></i>Support exporting design files for sharing or printing</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p>
                                        Với InkMe, bạn không cần biết về thiết kế chuyên nghiệp, không cần dùng phần mềm phức tạp – chỉ cần vài cú nhấp chuột là bạn đã có thể tạo nên sản phẩm in ấn chất lượng cao.
                                        Dù là tạo áo nhóm, áo đồng phục, hay đơn giản là một chiếc áo thể hiện cá tính – mọi thứ đều có thể làm được trên InkMe.
                                    </p>

                                    <div className="highlight-text">
                                        <h5>“Style is eternal – and now, you can create your own style in just a few minutes.”</h5>
                                    </div>

                                    <div className="service-image-item">
                                        <div className="row g-4">
                                            <h3>Actual images:</h3>
                                            <div className="col-lg-7">
                                                <div className="service-box-image">
                                                    <img src={simg1} alt="design image 1" />
                                                </div>
                                            </div>
                                            <div className="col-lg-5">
                                                <div className="service-box-image">
                                                    <img src={simg2} alt="design image 2" />
                                                </div>
                                            </div>
                                            <div className="col-lg-5">
                                                <div className="service-box-image">
                                                    <img src={simg3} alt="design image 3" />
                                                </div>
                                            </div>
                                            <div className="col-lg-7">
                                                <div className="service-box-image">
                                                    <img src={simg4} alt="design image 4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="faq-wrapper style-2">
                                        <div className="faq-content">
                                            <div className="faq-accordion">
                                                <Accordion />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};
// export default ServiceSinglePage;
export { ServiceSinglePage as InkMeServiceSinglePage };
