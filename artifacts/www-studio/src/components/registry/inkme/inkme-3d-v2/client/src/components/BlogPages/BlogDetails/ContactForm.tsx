import * as React from 'react';
import SimpleReactValidator from 'simple-react-validator';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        message: '',
    });

    const [validator] = useState(new SimpleReactValidator());
    const [, forceUpdate] = useState(); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        validator.showMessageFor(name); 
        forceUpdate(1); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validator.allValid()) {
            
            setFormData({
                name: '',
                email: '',
                phone: '',
                website: '',
                message: '',
            });
            validator.hideMessages(); 
            forceUpdate(1); 
        } else {
            validator.showMessages(); 
            forceUpdate(1); 
        }
    };

    return (
        <form action="#" id="contact-form" method="POST" onSubmit={handleSubmit}>
            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="form-clt">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name*"
                        />
                        {validator.message('name', formData.name, 'required|alpha_space')}
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="form-clt">
                        <input
                            type="text"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your Email*"
                        />
                        {validator.message('email', formData.email, 'required|email')}
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="form-clt">
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your number*"
                        />
                        {validator.message('phone', formData.phone, 'required|phone')}
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="form-clt">
                        <input
                            type="text"
                            name="website"
                            id="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="Website"
                        />
                        {validator.message('website', formData.website, 'url')}
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="form-clt">
                        <textarea
                            name="message"
                            id="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Enter your Message*"
                        ></textarea>
                        {validator.message('message', formData.message, 'required')}
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="form-check d-flex gap-2 from-customradio">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="flexRadioDefault"
                            id="flexRadioDefault12"
                        />
                        <label className="form-check-label" htmlFor="flexRadioDefault12">
                            Save my name, email, and website in this browser for the next time I comment.
                        </label>
                    </div>
                    <button type="submit" className="theme-btn">
                        Post Comment
                    </button>
                </div>
            </div>
        </form>
    );
};

// export default ContactForm;
export { ContactForm as InkMeContactForm };
