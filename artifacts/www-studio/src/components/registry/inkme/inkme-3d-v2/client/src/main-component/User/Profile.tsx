import * as React from 'react';
import { useMyContext } from '../../context/MyContext';
import { getUserById, updateUser, changePassword } from '../../services/UserServices';
import { Avatar } from "@mui/material";
import avatarDefault from "../../img/avatar_defaut.jpg";
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle';
import AddressManage from '../../components/AddressManage/AddressManage';
import OrdersList from '../OrdersPage/OrdersList/OrdersList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Profile.css';
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { userId } = useMyContext();
    const [activeTab, setActiveTab] = useState('personal');
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Form states
    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userData = await getUserById(userId);
            if (userData) {
                setUserInfo(userData);
                setPersonalInfo({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    dateOfBirth: userData.dateOfBirth || '',
                    gender: userData.gender || ''
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePersonalInfoUpdate = async (e) => {
        e.preventDefault();
        try {
            setUpdateLoading(true);
            await updateUser(userId, personalInfo);
            alert('Personal information has been updated successfully!');
            fetchUserData();
        } catch (error) {
            console.error('Error updating personal info:', error);
            alert('An error occurred while updating information!');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Confirmation password does not match!');
            return;
        }
        try {
            setUpdateLoading(true);
            await changePassword(userId, passwordForm.currentPassword, passwordForm.newPassword);
            alert('Password changed successfully!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            alert('An error occurred while changing the password!');
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <NavbarS2 hclass={'header-section-2 style-two'} />
                <PageTitle pageTitle={'InkMe - 3D Printing'} pagesub={'Thông tin cá nhân'} />
                <div className="profile-container">
                    <div className="container">
                        <div className="d-flex justify-content-center">
                            <div className="spinner-border profile-spinner" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'InkMe - 3D Printing'} pagesub={'Thông tin cá nhân'} />
            <div className="profile-container">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="card profile-card">
                                <div className="card-header profile-header">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <Avatar
                                                className="profile-avatar"
                                                alt={userInfo?.name}
                                                src={
                                                    Array.isArray(userInfo?.images) &&
                                                        userInfo.images.length > 0 &&
                                                        userInfo.images[0]
                                                        ? userInfo.images[0]
                                                        : avatarDefault
                                                }
                                                sx={{ width: 80, height: 80 }}
                                            />
                                        </div>
                                        <div className="col">
                                            <h3 className="profile-name">{userInfo?.name || 'User'}</h3>
                                            <p className="profile-email mb-0">{userInfo?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body p-0">
                                    {/* Navigation Tabs */}
                                    <ul className="nav nav-tabs nav-fill profile-tabs" id="profileTabs" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('personal')}
                                                type="button"
                                            >
                                                <i className="fas fa-user me-2"></i>
                                                Thông tin cá nhân
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('password')}
                                                type="button"
                                            >
                                                <i className="fas fa-lock me-2"></i>Change password</button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'address' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('address')}
                                                type="button"
                                            >
                                                <i className="fas fa-map-marker-alt me-2"></i>Address</button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('orders')}
                                                type="button"
                                            >
                                                <i className="fas fa-shopping-bag me-2"></i>Orders</button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('settings')}
                                                type="button"
                                            >
                                                <i className="fas fa-cog me-2"></i>Settings</button>
                                        </li>
                                    </ul>

                                    {/* Tab Content */}
                                    <div className="tab-content profile-tab-content">
                                        {/* Personal Information Tab */}
                                        {activeTab === 'personal' && (
                                            <div className="tab-pane fade show active">
                                                <h5 className="tab-title">
                                                    <i className="fas fa-user me-2"></i>
                                                    Thông tin cá nhân
                                                </h5>
                                                <form onSubmit={handlePersonalInfoUpdate}>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <i className="fas fa-user me-2"></i>
                                                            <label htmlFor="name" className="profile-form-label">Full name *</label>
                                                            <input
                                                                type="text"
                                                                className="form-control profile-form-control"
                                                                id="name"
                                                                value={personalInfo.name}
                                                                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <i className="fas fa-envelope me-2"></i>
                                                            <label htmlFor="email" className="profile-form-label">Email *</label>
                                                            <input
                                                                type="email"
                                                                className="form-control profile-form-control"
                                                                id="email"
                                                                value={personalInfo.email}
                                                                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <i className="fas fa-phone me-2"></i>
                                                            <label htmlFor="phone" className="profile-form-label">Phone number</label>
                                                            <input
                                                                type="tel"
                                                                className="form-control profile-form-control"
                                                                id="phone"
                                                                value={personalInfo.phone}
                                                                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <i className="fas fa-calendar-alt me-2"></i>
                                                            <label htmlFor="dateOfBirth" className="profile-form-label">Ngày sinh</label>
                                                            <input
                                                                type="date"
                                                                className="form-control profile-form-control"
                                                                id="dateOfBirth"
                                                                value={personalInfo.dateOfBirth}
                                                                onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <i className="fas fa-venus-mars me-2"></i>
                                                            <label htmlFor="gender" className="profile-form-label">Gender</label>
                                                            <select
                                                                className="form-select profile-form-control"
                                                                id="gender"
                                                                value={personalInfo.gender}
                                                                onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                                                            >
                                                                <option value="">Select gender</option>
                                                                <option value="male">Nam</option>
                                                                <option value="female">Female</option>
                                                                <option value="other">Khác</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-end">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-profile-primary"
                                                            disabled={updateLoading}
                                                        >
                                                            {updateLoading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>Updating.</>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-save me-2"></i>Update information</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Password Change Tab */}
                                        {activeTab === 'password' && (
                                            <div className="tab-pane fade show active">
                                                <h5 className="tab-title">
                                                    <i className="fas fa-lock me-2"></i>Change password</h5>
                                                <form onSubmit={handlePasswordChange}>
                                                    <div className="row">
                                                        <div className="col-md-8 mx-auto">
                                                            <div className="mb-3">
                                                                <label htmlFor="currentPassword" className="profile-form-label">Current password *</label>
                                                                <input
                                                                    type="password"
                                                                    className="form-control profile-form-control"
                                                                    id="currentPassword"
                                                                    value={passwordForm.currentPassword}
                                                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label htmlFor="newPassword" className="profile-form-label">New password *</label>
                                                                <input
                                                                    type="password"
                                                                    className="form-control profile-form-control"
                                                                    id="newPassword"
                                                                    value={passwordForm.newPassword}
                                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                                    required
                                                                    minLength="6"
                                                                />
                                                                <div className="form-text">Password must be at least 6 characters</div>
                                                            </div>
                                                            <div className="mb-4">
                                                                <label htmlFor="confirmPassword" className="profile-form-label">Confirm new password *</label>
                                                                <input
                                                                    type="password"
                                                                    className="form-control profile-form-control"
                                                                    id="confirmPassword"
                                                                    value={passwordForm.confirmPassword}
                                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="d-flex justify-content-end">
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-profile-primary"
                                                                    disabled={updateLoading}
                                                                >
                                                                    {updateLoading ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>Changing...</>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-key me-2"></i>Change password</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Address Management Tab */}
                                        {activeTab === 'address' && (
                                            <div className="tab-pane fade show active">
                                                <div className="profile-address-container">
                                                    <AddressManage />
                                                </div>
                                            </div>
                                        )}

                                        {/* Orders Tab */}
                                        {activeTab === 'orders' && (
                                            <div className="tab-pane fade show active">
                                                <div className="profile-orders-container">
                                                    <OrdersList />
                                                </div>
                                            </div>
                                        )}

                                        {/* Settings Tab */}
                                        {activeTab === 'settings' && (
                                            <div className="tab-pane fade show active">
                                                <h5 className="tab-title">
                                                    <i className="fas fa-cog me-2"></i>Account settings</h5>
                                                <div className="row">
                                                    <div className="col-md-8">
                                                        <div className="card settings-card">
                                                            <div className="card-body">
                                                                <h6 className="card-title">Thông báo</h6>
                                                                <div className="form-check form-switch mb-3">
                                                                    <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
                                                                    <label className="form-check-label" htmlFor="emailNotifications">Receive notifications via email</label>
                                                                </div>
                                                                <div className="form-check form-switch mb-3">
                                                                    <input className="form-check-input" type="checkbox" id="smsNotifications" />
                                                                    <label className="form-check-label" htmlFor="smsNotifications">Receive notifications via SMS</label>
                                                                </div>
                                                                <div className="form-check form-switch mb-3">
                                                                    <input className="form-check-input" type="checkbox" id="promotionNotifications" defaultChecked />
                                                                    <label className="form-check-label" htmlFor="promotionNotifications">Receive promotional notifications</label>
                                                                </div>

                                                                <div className="danger-zone">
                                                                    <h6>Danger Zone</h6>
                                                                    <p className="text-muted small">These actions cannot be undone</p>
                                                                    <button className="btn btn-profile-danger">
                                                                        <i className="fas fa-user-times me-2"></i>Disable account</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CtaSectionS2 />
            <FooterS3 />
        </>
    );
};

// export default Profile;
export { Profile as InkMeProfile };
