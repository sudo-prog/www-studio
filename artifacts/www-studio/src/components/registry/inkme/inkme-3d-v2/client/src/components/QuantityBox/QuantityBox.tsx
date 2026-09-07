import * as React from 'react'
import { FaMinus, FaPlus } from "react-icons/fa";
import { Button, CircularProgress } from "@mui/material";

const QuantityBox = ({ value, onQuantityChange, loading }) => {
    const [inputValue, setInputValue] = useState(value || 1);
    const [isEditing, setIsEditing] = useState(false);

    //Update value when `value` changes from props
    useEffect(() => {
        if (value !== undefined && value !== null && value !== '') {
            setInputValue(parseInt(value));
        }
    }, [value]);

    //Function to update quantity and call API if changed
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        setInputValue(newQuantity);
        if (!isEditing) {
            onQuantityChange(newQuantity);
        }
    };

    //Handle when user changes quantity by direct input
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        if (/^\d*$/.test(newValue)) { //Only allow numeric input
            setInputValue(newValue);
        }
    };

    //Update cart when pressing Enter or losing focus
    const handleInputBlur = () => {
        setIsEditing(false);
        const newQuantity = parseInt(inputValue) || 1;
        if (newQuantity !== value) {
            onQuantityChange(newQuantity);
        }
    };

    const handleInputFocus = () => {
        setIsEditing(true);
    };

    //Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.target.blur();
        }
    };

    const minus = () => {
        if (inputValue > 1) {
            handleQuantityChange(inputValue - 1);
        }
    };

    const plus = () => {
        handleQuantityChange(inputValue + 1);
    };

    return (
        <div className="quantityDrop d-flex align-items-center">
            <Button
                onClick={minus}
                disabled={loading || inputValue <= 1}
                className="quantity-btn"
            >
                {loading ? <CircularProgress size={20} /> : <FaMinus />}
            </Button>
            <input 
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                onKeyPress={handleKeyPress}
                className="quantity-input"
                disabled={loading}
                style={{ width: '50px', color: 'black', border: '1px solid #ccc', borderRadius: '5px', textAlign: 'center' }}
            />
            <Button
                onClick={plus}
                disabled={loading}
                className="quantity-btn"
            >
                {loading ? <CircularProgress size={20} /> : <FaPlus />}
            </Button>
        </div>
    );
};

// export default QuantityBox;
export { QuantityBox as InkMeQuantityBox };
