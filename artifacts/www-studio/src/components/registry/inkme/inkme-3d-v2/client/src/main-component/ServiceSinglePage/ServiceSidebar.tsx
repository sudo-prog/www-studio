import React from 'react'
import Services from '../../api/Services';
import { Link } from 'react-router-dom'
import Bg from '../../img/service/service-contact.jpg'

const ServiceSidebar = (props) => {

    const SubmitHandler = (e) => {
        e.preventDefault()
    }

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <div className="service-sidebar">
            <div className="service-widget-categories">
                <ul>
                    {
                        Services.slice(0, 4).map((service, Sitem) => (
                            <li key={Sitem}><Link onClick={ClickHandler} to={`/service-details/${service.slug}`}>{service.title}</Link> <span><i className="fa-regular fa-arrow-right-long"></i></span></li>
                        ))
                    }
                </ul>
            </div>
            <div className="contact-bg text-center bg-cover" style={{ backgroundImage: `url("https://prinoz-react.wpocean.com/static/media/cta-video.b253db58685dddc0a7c1.jpg")` }}>
                <div className="icon">
                    <i className="fa-light fa-phone-volume"></i>
                </div>
                <h3>
                    Looking for <br />
                    printing service <br />
                    Provider?
                </h3>
                <p>Call anytime</p>
                <a href="tel:+2871382023" className="theme-btn w-100">
                    +(2) 871 382 023
                </a>

            </div>
        </div>

    )
}

// export default ServiceSidebar;






export { ServiceSidebar as InkMeServiceSidebar };
