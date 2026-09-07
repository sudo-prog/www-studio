import * as React from 'react'
import { MyContext } from '../../../context/MyContext';
import { TextField, Button } from '@mui/material';
import { editData } from '../../../utils/api';

const UserInfoCheckout = () => {

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        note: user?.note || ''
    });
    const [error, setError] = useState('');

    const context = useContext(MyContext);

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedUser({
            name: user?.name || '',
            phone: user?.phone || '',
            email: user?.email || '',
            note: user?.note || ''
        });
    };

    const handleInputChange = (field) => async (event) => {
        const value = event.target.value;
        setEditedUser((prev) => ({
            ...prev,
            [field]: value
        }));
        //If it is a note, automatically save to localStorage and call API
        if (field === 'note') {
            const updatedUser = { ...user, note: value };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            //Call API to update note for user
            try {
                await editData(`/api/user/${user?.userId}`, { note: value });
            } catch (err) {
                //No need to report error, just log
                console.error('Error updating note:', err);
            }
        }
    };

    const handleEditUser = async () => {
        try {
            const response = await editData(`/api/user/${user?.userId}`, editedUser);
            if (response.error) {
                setError(response.message);
                return;
            }

            if (editedUser.name === '') {
                setError('Full name cannot be left blank');
                return;
            }

            if (editedUser.phone === '' || editedUser.phone.length !== 10) {
                setError('Phone number cannot be left blank and must have 10 digits');
                return;
            }

            if (editedUser.email === '' || !editedUser.email.includes('@')) {
                setError('Email cannot be left blank');
                return;
            }

            // Update local storage with new user data
            const updatedUser = { ...user, ...editedUser };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            setError('');
            context.setAlterBox({
                open: true,
                error: false,
                message: "Information updated successfully!",
            });
        } catch (err) {
            setError('An error occurred while updating information');
            context.setAlterBox({
                open: true,
                error: true,
                message: "An error occurred while updating information",
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
    };

    return (
        <div className="checkout-single boxshado-single">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>Thông tin cá nhân</h4>
                {!isEditing ? (
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleEditClick}
                        style={{ marginBottom: '15px' }}
                    >Edit</Button>
                ) : (
                    <div style={{ marginBottom: '15px' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleEditUser}
                            style={{ marginRight: '10px' }}
                        >Save</Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancel}
                        >Cancel</Button>
                    </div>
                )}
            </div>
            {error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
            <div className="checkout-single-form">
                <div className="row g-4">
                    <div className="col-lg-4">
                        <TextField
                            fullWidth
                            className='checkout-input'
                            label="Full name"
                            value={isEditing ? editedUser.name : (user?.name || '')}
                            variant="outlined"
                            onChange={handleInputChange('name')}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="col-lg-4">
                        <TextField
                            fullWidth
                            className='checkout-input'
                            label="Phone number"
                            value={isEditing ? editedUser.phone : (user?.phone || '')}
                            variant="outlined"
                            onChange={handleInputChange('phone')}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="col-lg-4">
                        <TextField
                            fullWidth
                            type="email"
                            className='checkout-input'
                            label="Email"
                            value={isEditing ? editedUser.email : (user?.email || '')}
                            variant="outlined"
                            onChange={handleInputChange('email')}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="col-lg-12">
                        <TextField
                            fullWidth
                            className='checkout-input'
                            label="Ghi chú"
                            value={editedUser.note}
                            variant="outlined"
                            onChange={handleInputChange('note')}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// export default UserInfoCheckout
export { UserInfoCheckout as InkMeUserInfoCheckout };
