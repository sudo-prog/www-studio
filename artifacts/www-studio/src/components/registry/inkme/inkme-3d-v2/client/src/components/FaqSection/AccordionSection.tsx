import * as React from 'react';

const AccordionSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="accordion" id="accordion">
      <div className="accordion-item wow fadeInUp">
        <h4 className="accordion-header">
          <button
            className={`accordion-button ${activeIndex === 0 ? '' : 'collapsed'}`}
            onClick={() => toggleAccordion(0)}
          >
            What is ChatGPT?
          </button>
        </h4>
        <div className={`accordion-collapse collapse ${activeIndex === 0 ? 'show' : ''}`}>
          <div className="accordion-body">
            Good Time is very good in what they're doing and more than happy to challenge and push you to
            think about your decisions both from usabil
          </div>
        </div>
      </div>

      <div className="accordion-item wow fadeInUp">
        <h4 className="accordion-header">
          <button
            className={`accordion-button ${activeIndex === 1 ? '' : 'collapsed'}`}
            onClick={() => toggleAccordion(1)}
          >
            What is ChatGPT used for?
          </button>
        </h4>
        <div className={`accordion-collapse collapse ${activeIndex === 1 ? 'show' : ''}`}>
          <div className="accordion-body">
            Good Time is very good in what they're doing and more than happy to challenge and push you to
            think about your decisions both from usabil
          </div>
        </div>
      </div>

      <div className="accordion-item wow fadeInUp">
        <h4 className="accordion-header">
          <button
            className={`accordion-button ${activeIndex === 2 ? '' : 'collapsed'}`}
            onClick={() => toggleAccordion(2)}
          >
            How is Chatsonic different from ChatGPT by OpenAI?
          </button>
        </h4>
        <div className={`accordion-collapse collapse ${activeIndex === 2 ? 'show' : ''}`}>
          <div className="accordion-body">
            Good Time is very good in what they're doing and more than happy to challenge and push you to
            think about your decisions both from usabil
          </div>
        </div>
      </div>

      <div className="accordion-item wow fadeInUp">
        <h4 className="accordion-header">
          <button
            className={`accordion-button ${activeIndex === 3 ? '' : 'collapsed'}`}
            onClick={() => toggleAccordion(3)}
          >
            Does Chatsonic help with giving out the latest trends and news?
          </button>
        </h4>
        <div className={`accordion-collapse collapse ${activeIndex === 3 ? 'show' : ''}`}>
          <div className="accordion-body">
            Good Time is very good in what they're doing and more than happy to challenge and push you to
            think about your decisions both from usabil
          </div>
        </div>
      </div>
      <div className="accordion-item wow fadeInUp">
        <h4 className="accordion-header">
          <button
            className={`accordion-button ${activeIndex === 4 ? '' : 'collapsed'}`}
            onClick={() => toggleAccordion(4)}
          >
            Is Chatsonic free to use?
          </button>
        </h4>
        <div className={`accordion-collapse collapse ${activeIndex === 4 ? 'show' : ''}`}>
          <div className="accordion-body">
            Good Time is very good in what they're doing and more than happy to challenge and push you to
            think about your decisions both from usabil
          </div>
        </div>
      </div>

    </div>
  );
};

// export default AccordionSection;
export { AccordionSection as InkMeAccordionSection };
