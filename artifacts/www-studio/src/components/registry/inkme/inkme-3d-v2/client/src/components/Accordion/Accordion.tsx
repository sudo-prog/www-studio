import * as React from 'react';
import './Accordion.css';

const Accordion = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const handleToggle = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const accordionData = [
        {
            title: 'How do I design a shirt using InkMe?',
            content:
                'Simply access the 3D designer, choose your favorite shirt template, and start adding images, text, or colors as desired. The interface is simple and easy to use, even for beginners.',
        },
        {
            title: 'Can I reuse a design I have already created?',
            content:
                'Absolutely. You can save the design file (.inkme) to reopen, edit, or add to your cart at any time.',
        },
        {
            title: 'Why is my design not displaying clearly on the shirt?',
            content:
                'The images you are using may have a low resolution. InkMe uses AI to check image quality – if it is blurry, the system will warn you to replace it before printing.',
        },
        {
            title: 'What is a .inkme file and what is it used for?',
            content:
                'The .inkme file is a format that contains your entire 3D design layout (images, text, positions, etc.). This file can be downloaded, shared, or reused later for further editing and printing.',
        }
    ];

    return (
        <div className="accordion">
            {accordionData.map((item, index) => (
                <div className={`accordion-item ${activeIndex === index ? 'active' : ''}`} key={index}>
                    <div className="accordion-header">
                        <button className="accordion-button" onClick={() => handleToggle(index)}>
                            {item.title}
                        </button>
                    </div>
                    <div className="accordion-content">
                        {activeIndex === index && <p>{item.content}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

// export default Accordion;
export { Accordion as InkMeAccordion };
