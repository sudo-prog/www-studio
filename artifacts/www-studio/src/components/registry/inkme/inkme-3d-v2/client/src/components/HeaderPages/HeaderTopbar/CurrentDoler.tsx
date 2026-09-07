import * as React from 'react';
import Select from 'react-select';

const CurrentDoler = () => {
    const options = [
        { value: 'USD', label: 'USD' },
        { value: 'EURO', label: 'EURO' },
        { value: 'CNY', label: 'CNY' },
        { value: 'BSD', label: 'BSD' },
    ];

    const [selectedOption, setSelectedOption] = useState(null);

    const handleChange = (selectedOption) => {
        setSelectedOption(selectedOption);
    };

    return (
        <div className="nice-items">
            <Select
                value={selectedOption}
                onChange={handleChange}
                options={options}
            />
        </div>
    );
};

// export default CurrentDoler;
export { CurrentDoler as InkMeCurrentDoler };
