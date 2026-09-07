import * as React from 'react';
import SimpleReactValidator from 'simple-react-validator';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
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
        <form onSubmit={handleSubmit}>
            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="form-clt">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
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
                            placeholder="Email Address"
                        />
                        {validator.message('email', formData.email, 'required|email')}
                    </div>
                </div>
                <div className="col-lg-12 wow fadeInUp" data-wow-delay=".8">
                    <div className="form-clt-big form-clt">
                        <textarea
                            name="message"
                            id="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Message"
                        ></textarea>
                        {validator.message('message', formData.message, 'required')}
                    </div>
                </div>
                <div className="col-lg-6 wow fadeInUp" data-wow-delay=".9">
                    <button type="submit" className="theme-btn">
                        Post Submit
                    </button>
                </div>
            </div>
        </form>
    );
};

// export default ContactForm;
export { ContactForm as InkMeContactForm };
