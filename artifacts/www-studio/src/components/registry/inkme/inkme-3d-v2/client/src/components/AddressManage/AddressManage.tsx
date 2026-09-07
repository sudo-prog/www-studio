import * as React from 'react'
import { Edit, Delete, Add } from '@mui/icons-material';
import { postData, editData, deleteData, fetchDataFromApi } from '../../utils/api';
import PayOSPayment from '../Payment/PayOSPayment';
import { Link } from 'react-router-dom';
import { TextField, MenuItem, FormControlLabel, Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Card, CardContent, Typography, Box, Radio, RadioGroup, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import * as React from 'react'; // originally: import { useContext } from 'react';
import { MyContext } from '../../context/MyContext';


const AddressManage = () => {
    const context = useContext(MyContext);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [addresses, setAddresses] = useState([]);
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [showEditAddressModal, setShowEditAddressModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [deletingAddressId, setDeletingAddressId] = useState(null);
    const [newAddress, setNewAddress] = useState({
        province: '',
        district: '',
        ward: '',
        provinceName: '',
        districtName: '',
        wardName: '',
        details: '',
        moreInfo: ''
    });

    // State for address data from API
    const [addressData, setAddressData] = useState({
        provinces: [],
        districts: [],
        wards: []
    });

    // Loading states for address API calls
    const [addressLoading, setAddressLoading] = useState({
        provinces: false,
        districts: false,
        wards: false
    });

    // Fetch provinces, districts, wards from API
    const fetchProvinces = async () => {
        setAddressLoading(prev => ({ ...prev, provinces: true }));
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await response.json();
            setAddressData(prev => ({ ...prev, provinces: data }));
        } catch (error) {
            console.error('Error fetching provinces:', error);
            context.setAlterBox({
                open: true,
                error: true,
                message: "Unable to load province/city data",
            });
        } finally {
            setAddressLoading(prev => ({ ...prev, provinces: false }));
        }
    };

    const fetchDistricts = async (provinceCode) => {
        setAddressLoading(prev => ({ ...prev, districts: true }));
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            setAddressData(prev => ({ ...prev, districts: data.districts || [] }));
        } catch (error) {
            console.error('Error fetching districts:', error);
            context.setAlterBox({
                open: true,
                error: true,
                message: "Unable to load district data",
            });
        } finally {
            setAddressLoading(prev => ({ ...prev, districts: false }));
        }
    };

    const fetchWards = async (districtCode) => {
        setAddressLoading(prev => ({ ...prev, wards: true }));
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await response.json();
            setAddressData(prev => ({ ...prev, wards: data.wards || [] }));
        } catch (error) {
            console.error('Error fetching wards:', error);
            context.setAlterBox({
                open: true,
                error: true,
                message: "Unable to load ward/commune data",
            });
        } finally {
            setAddressLoading(prev => ({ ...prev, wards: false }));
        }
    };

    const fetchAddresses = useCallback(async () => {
        try {
            const response = await fetchDataFromApi(`/api/address/user/${user?.userId}`);
            setAddresses(response);
            // Set selected address to default address if exists
            const defaultAddress = response.find(addr => addr.isDefault);
            if (defaultAddress) {
                context.setSelectedAddressId(defaultAddress._id);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    }, [user?.userId, context]);

    // Fetch addresses when component mounts
    useEffect(() => {
        if (user?.userId) {
            fetchAddresses();
        }
    }, [user?.userId, fetchAddresses]);

    // Fetch provinces when component mounts
    useEffect(() => {
        fetchProvinces();
    }, []);

    // Helper function to reset address form
    const resetAddressForm = () => {
        setNewAddress({
            province: '',
            district: '',
            ward: '',
            provinceName: '',
            districtName: '',
            wardName: '',
            details: '',
            moreInfo: ''
        });
        setAddressData(prev => ({
            ...prev,
            districts: [],
            wards: []
        }));
    };

    // Helper function to reset edit form
    const resetEditForm = () => {
        setEditingAddress(null);
        setAddressData(prev => ({
            ...prev,
            districts: [],
            wards: []
        }));
    };

    // Handle province change for new address
    const handleProvinceChange = (value, isEditing = false) => {
        const selectedProvince = addressData.provinces.find(p => p.code === value);

        if (isEditing) {
            setEditingAddress(prev => ({
                ...prev,
                province: value,
                provinceName: selectedProvince?.name || '',
                district: '',
                districtName: '',
                ward: '',
                wardName: ''
            }));
        } else {
            setNewAddress(prev => ({
                ...prev,
                province: value,
                provinceName: selectedProvince?.name || '',
                district: '',
                districtName: '',
                ward: '',
                wardName: ''
            }));
        }

        // Clear districts and wards
        setAddressData(prev => ({
            ...prev,
            districts: [],
            wards: []
        }));

        // Fetch districts for selected province
        if (value) {
            fetchDistricts(value);
        }
    };

    // Handle district change
    const handleDistrictChange = (value, isEditing = false) => {
        const selectedDistrict = addressData.districts.find(d => d.code === value);

        if (isEditing) {
            setEditingAddress(prev => ({
                ...prev,
                district: value,
                districtName: selectedDistrict?.name || '',
                ward: '',
                wardName: ''
            }));
        } else {
            setNewAddress(prev => ({
                ...prev,
                district: value,
                districtName: selectedDistrict?.name || '',
                ward: '',
                wardName: ''
            }));
        }

        // Clear wards
        setAddressData(prev => ({
            ...prev,
            wards: []
        }));

        // Fetch wards for selected district
        if (value) {
            fetchWards(value);
        }
    };

    // Handle ward change
    const handleWardChange = (value, isEditing = false) => {
        const selectedWard = addressData.wards.find(w => w.code === value);

        if (isEditing) {
            setEditingAddress(prev => ({
                ...prev,
                ward: value,
                wardName: selectedWard?.name || ''
            }));
        } else {
            setNewAddress(prev => ({
                ...prev,
                ward: value,
                wardName: selectedWard?.name || ''
            }));
        }
    };

    //Processing addition of new address
    const handleAddAddress = async () => {
        try {
            if (!newAddress.province || !newAddress.district || !newAddress.ward || !newAddress.details) {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "Please fill in the complete address information",
                });
                return;
            }

            // Create full address string
            const fullAddress = `${newAddress.wardName}, ${newAddress.districtName}, ${newAddress.provinceName}`;

            const response = await postData(`/api/address`, {
                userId: user.userId,
                province: newAddress.province,
                provinceName: newAddress.provinceName,
                district: newAddress.district,
                districtName: newAddress.districtName,
                ward: newAddress.ward,
                wardName: newAddress.wardName,
                city: fullAddress, // For backward compatibility
                details: newAddress.details,
                moreInfo: newAddress.moreInfo
            });

            if (response.error) {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "An error occurred while adding the address",
                });
                return;
            }

            await fetchAddresses();
            setShowAddAddressModal(false);
            resetAddressForm();
            context.setAlterBox({
                open: true,
                error: false,
                message: "Address added successfully!",
            });
        } catch (error) {
            console.error('Error adding address:', error);
            context.setAlterBox({
                open: true,
                error: true,
                message: "An error occurred while adding the address",
            });
        }
    };

    //Processing address edit
    const handleEditAddress = async () => {
        try {
            if (!editingAddress.province || !editingAddress.district || !editingAddress.ward || !editingAddress.details) {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "Please fill in the complete address information",
                });
                return;
            }

            // Create full address string
            const fullAddress = `${editingAddress.wardName}, ${editingAddress.districtName}, ${editingAddress.provinceName}`;

            const response = await editData(`/api/address/${editingAddress._id}`, {
                province: editingAddress.province,
                provinceName: editingAddress.provinceName,
                district: editingAddress.district,
                districtName: editingAddress.districtName,
                ward: editingAddress.ward,
                wardName: editingAddress.wardName,
                city: fullAddress, // For backward compatibility
                details: editingAddress.details,
                moreInfo: editingAddress.moreInfo
            });

            if (response.error) {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "An error occurred while editing the address",
                });
                return;
            }

            await fetchAddresses();
            setShowEditAddressModal(false);
            resetEditForm();
            context.setAlterBox({
                open: true,
                error: false,
                message: "Address updated successfully!",
            });
        } catch (error) {
            console.error('Error editing address:', error);
            context.setAlterBox({
                open: true,
                error: true,
                message: "An error occurred while editing the address",
            });
        }
    };

    //Show delete confirmation dialog
    const showDeleteConfirmation = (addressId) => {
        setDeletingAddressId(addressId);
        setShowDeleteConfirmModal(true);
    };

    //Processing address deletion
    const handleDeleteAddress = async () => {
        try {
            const response = await deleteData(`/api/address/${deletingAddressId}`);

            if (response.error) {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: response.notify || response.message || "An error occurred while deleting the address",
                });
                return;
            }

            await fetchAddresses();
            if (context.selectedAddressId === deletingAddressId) {
                context.setSelectedAddressId('');
            }
            setShowDeleteConfirmModal(false);
            setDeletingAddressId(null);
            context.setAlterBox({
                open: true,
                error: false,
                message: "Address deleted successfully!",
            });
        } catch (error) {
            console.error('Error deleting address:', error);
            context.setAlterBox({
                open: true,
                error: true,
                message: "An error occurred while deleting the address",
            });
        }
    };

    //Processing default address setting
   Address listaultAddress = async (addressId) => {
        try {
            const response = await editData(`/api/address/${addressId}/set-default`);

            if (response.error) {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: response.notify || response.message || "An error occurred while setting the default address",
                });
                return;
            }

            await fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            context.setAlterBox({
                open: true,
                error: true,
                message: "An error occurred while setting the default address",
            });
        }
    };

    return (
        <div className="checkout-single boxshado-single">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4>Shipping address</h4>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setShowAddAddressModal(true)}
                    style={{ backgroundColor: '#28a745' }}
                >Add address</Button>
            </div>{/* Address list */}<RadioGroup value={context.selectedAddressId} onChange={(e) => context.setSelectedAddressId(e.target.value)}>
                {addresses.length > 0 ? (
                    addresses.map((addr) => (
                        <Card key={addr._id} style={{ marginBottom: '10px', border: context.selectedAddressId === addr._id ? '2px solid #007bff' : '1px solid #ddd' }}>
                            <CardContent style={{ padding: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                        <Radio value={addr._id} />
                                        <div style={{ marginLeft: '10px' }}>
                                            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                                                {addr.provinceName && addr.districtName && addr.wardName
                                                    ? `${addr.wardName}, ${addr.districtName}, ${addr.provinceName}`
                                                    : addr.city}
                                                {addr.isDefault && (
                                                    <span style={{ marginLeft: '10px', color: '#28a745', fontSize: '0.8em' }}>(Default)</span>
                                                )}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {addr.details}
                                            </Typography>
                                            {addr.moreInfo && (
                                                <Typography variant="body2" color="textSecondary">
                                                    {addr.moreInfo}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {!addr.isDefault && (
                                            <Button
                                                size="small"
                                                onClick={() => handleSetDefaultAddress(addr._id)}
                                                style={{ marginRight: '10px' }}
                                            >Set as default</Button>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditingAddress(addr);
                                                setShowEditAddressModal(true);
                                                // Load districts and wards if address has province Add address modal                                         if (addr.province) {
                                                    fetchDistricts(addr.province);
                                                    if (addr.district) {
                                                        fetchWards(addr.district);
                                                    }
                                                }
                                            }}
                                            style={{ marginRight: '5px' }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => showDeleteConfirmation(addr._id)}
                                            color="error"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography variant="body1" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>No addresses found. Please add a delivery address.</Typography>
                )}
            </RadioGroup>{/* Add address modal */}<Dialog open={showAddAddressModal} onClose={() => setShowAddAddressModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add new address</DialogTitle>
                <DialogContent>
                    <div style={{ paddingTop: '10px' }}>
                        {/* Province Selection */}
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Province/City</InputLabel>
                            <Select
                                value={newAddress.province}
                                onChange={(e) => handleProvinceChange(e.target.value)}
                                label="Province/City"
                                disabled={addressLoading.provinces}
                            >
                                {addressLoading.provinces ? (
                                    <MenuItem disabled>
                                        <CircularProgress size={20} style={{ marginRight: 10 }} />
                                        Đang tải...
                                    </MenuItem>
                                ) : (
                                    addressData.provinces.map((province) => (
                                        <MenuItem key={province.code} value={province.code}>
                                            {province.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        {/* District Selection */}
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>District</InputLabel>
                            <Select
                                value={newAddress.district}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                label="District"
                                disabled={!newAddress.province || addressLoading.districts}
                            >
                                {addressLoading.districts ? (
                                    <MenuItem disabled>
                                        <CircularProgress size={20} style={{ marginRight: 10 }} />
                                        Đang tải...
                                    </MenuItem>
                                ) : (
                                    addressData.districts.map((district) => (
                                        <MenuItem key={district.code} value={district.code}>
                                            {district.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        {/* Ward Selection */}
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Ward/Commune</InputLabel>
                            <Select
                                value={newAddress.ward}
                                onChange={(e) => handleWardChange(e.target.value)}
                                label="Ward/Commune"
                                disabled={!newAddress.district || addressLoading.wards}
                            >
                                {addressLoading.wards ? (
                                    <MenuItem disabled>
                                        <CircularProgress size={20} style={{ marginRight: 10 }} />
                                        Đang tải...
                                    </MenuItem>
                                ) : (
                                    addressData.wards.map((ward) => (
                          Edit address modalItem key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Detailed address"
                            value={newAddress.details}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, details: e.target.value }))}
                            margin="normal"
                            multiline
                            rows={3}
                            required
                            placeholder="House number, street name."
                        />
                        <TextField
                            fullWidth
                            label="Thông tin bổ sung"
                            value={newAddress.moreInfo}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, moreInfo: e.target.value }))}
                            margin="normal"
                            multiline
                            rows={2}
                            placeholder="Additional notes (optional)"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowAddAddressModal(false);
                        resetAddressForm();
                    }}>Cancel</Button>
                    <Button onClick={handleAddAddress} variant="contained">Thêm</Button>
                </DialogActions>
            </Dialog>{/* Edit address modal */}<Dialog open={showEditAddressModal} onClose={() => setShowEditAddressModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit address</DialogTitle>
                <DialogContent>
                    {editingAddress && (
                        <div style={{ paddingTop: '10px' }}>
                            {/* Province Selection */}
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel>Province/City</InputLabel>
                                <Select
                                    value={editingAddress.province || ''}
                                    onChange={(e) => handleProvinceChange(e.target.value, true)}
                                    label="Province/City"
                                    disabled={addressLoading.provinces}
                                >
                                    {addressLoading.provinces ? (
                                        <MenuItem disabled>
                                            <CircularProgress size={20} style={{ marginRight: 10 }} />
                                            Đang tải...
                                        </MenuItem>
                                    ) : (
                                        addressData.provinces.map((province) => (
                                            <MenuItem key={province.code} value={province.code}>
                                                {province.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            {/* District Selection */}
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel>District</InputLabel>
                                <Select
                                    value={editingAddress.district || ''}
                                    onChange={(e) => handleDistrictChange(e.target.value, true)}
                                    label="District"
                                    disabled={!editingAddress.province || addressLoading.districts}
                                >
                                    {addressLoading.districts ? (
                                        <MenuItem disabled>
                                            <CircularProgress size={20} style={{ marginRight: 10 }} />
                                            Đang tải...
                                        </MenuItem>
                                    ) : (
                                        addressData.districts.map((district) => (
                                            <MenuItem key={district.code} value={district.code}>
                                                {district.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            {/* Ward Selection */}
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel>Ward/Commune</InputLabel>
                                <Select
                                    value={editingAddress.ward || ''}
                                    onChange={(e) => handleWardChange(e.target.value, true)}
                                    label="Ward/Commune"
                                    disabled={!editingAddress.district || addressLoading.wards}
                                >
                                    {addressLoading.wards ? (
                                        <MenuItem disabled>
                                            <CircularProgress size={20} style={{ marginRight: 10 }} />
                                            Đang tải...
                                        </MenuItem>
                                    ) : (
                                        addressData.wards.map((ward) => (
                                    Address delete confirmation modalcode} value={ward.code}>
                                                {ward.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Detailed address"
                                value={editingAddress.details}
                                onChange={(e) => setEditingAddress(prev => ({ ...prev, details: e.target.value }))}
                                margin="normal"
                                multiline
                                rows={3}
                                required
                                placeholder="House number, street name."
                            />
                            <TextField
                                fullWidth
                                label="Thông tin bổ sung"
                                value={editingAddress.moreInfo || ''}
                                onChange={(e) => setEditingAddress(prev => ({ ...prev, moreInfo: e.target.value }))}
                                margin="normal"
                                multiline
                                rows={2}
                                placeholder="Additional notes (optional)"
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowEditAddressModal(false);
                        resetEditForm();
                    }}>Cancel</Button>
                    <Button onClick={handleEditAddress} variant="contained">Cập nhật</Button>
                </DialogActions>
            </Dialog>{/* Address delete confirmation modal */}<Dialog open={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this address? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowDeleteConfirmModal(false);
                        setDeletingAddressId(null);
                    }}>Cancel</Button>
                    <Button onClick={handleDeleteAddress} variant="contained" color="error">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </div>


    )
}

// export default AddressManage
export { AddressManage as InkMeAddressManage };
