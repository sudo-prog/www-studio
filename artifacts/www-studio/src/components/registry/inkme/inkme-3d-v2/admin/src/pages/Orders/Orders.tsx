import * as React from 'react';
import { Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Breadcrumbs, styled, emphasize, Select, MenuItem } from "@mui/material";
import { editData, fetchDataFromApi, deleteData } from "../../utils/api";
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from "react-router-dom";
import { FaCartArrowDown } from "react-icons/fa6";
import InkMeFile from "../../components/InkMeFile";
import './orders.css';

//breadcrumb
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[800];

    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        "&:hover, &:focus": {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        "&:active": {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [loading, setLoading] = useState({});
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState(null);
    const [showHiddenOrders, setShowHiddenOrders] = useState(false);
    const [sortBy, setSortBy] = useState('dateCreated');
    const [sortOrder, setSortOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchOrders();
    }, [showHiddenOrders, sortBy, sortOrder, statusFilter, searchTerm, dateRange]);

    const fetchOrders = () => {
        setOrdersLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        params.append('showHidden', showHiddenOrders.toString());
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (searchTerm) params.append('search', searchTerm);
        if (dateRange.start) params.append('startDate', dateRange.start);
        if (dateRange.end) params.append('endDate', dateRange.end);

        const url = `/api/orders/admin/list?${params.toString()}`;

        fetchDataFromApi(url)
            .then((data) => {
                if (data && Array.isArray(data.ordersList)) {
                    setOrders(data.ordersList);
                } else {
                    setOrders([]);
                }
            }).catch((error) => {
                console.error("Order load error:", error);
                setError("Unable to load order list. Please try again.");
            }).finally(() => {
                setOrdersLoading(false);
            });
    };

    const handleOpenProducts = (products) => {
        setSelectedProducts(products);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedProducts([]);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
            case "unpaid":
                return { color: "#ffc107", bg: "#fff3cd", label: "Pending payment" };
            case "paid":
            case "success":
                return { color: "#28a745", bg: "#d4edda", label: "Paid" };
            case "failed":
                return { color: "#dc3545", bg: "#f8d7da", label: "Failed" };
            case "processing":
                return { color: "#17a2b8", bg: "#d1ecf1", label: "Processing" };
            case "shipped":
                return { color: "#6f42c1", bg: "#e2d9f3", label: "Delivered" };
            case "cancelled":
                return { color: "#6c757d", bg: "#e2e3e5", label: "Cancelled" };
            default:
                return { color: "#6c757d", bg: "#e2e3e5", label: "Undefined" };
        }
    };

    const handleChangeStatus = async (orderId, newStatus) => {
        setLoading(prev => ({ ...prev, [orderId]: true }));

        try {
            const orderData = await fetchDataFromApi(`/api/orders/${orderId}`);
            const updatedOrder = {
                ...orderData,
                status: newStatus
            };

            await editData(`/api/orders/${orderId}`, updatedOrder);
            fetchOrders(); // Refresh orders list
        } catch (error) {
            console.error("Status update error:", error);
        } finally {
            setLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const hasValidImages = (product) => {
        return product.images &&
            product.images.length > 0 &&
            product.images[0] &&
            product.images[0].trim() !== '';
    };

    const getProductTypeInfo = (product) => {
        if (hasValidImages(product)) {
            return 'Standard';
        } else if (product.inkmeFile) {
            return '3D Custom';
        } else {
            return 'No Image';
        }
    };

    // Filter and sort functions
    const clearFilters = () => {
        setStatusFilter('all');
        setSearchTerm('');
        setDateRange({ start: '', end: '' });
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const getFilteredOrdersCount = () => {
        return orders.length;
    };

    // Handle edit order
    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setEditDialogOpen(true);
    };

    // Handle save edited order
    const handleSaveOrder = async (updatedOrder) => {
        try {
            await editData(`/api/orders/${updatedOrder._id}`, updatedOrder);
            setEditDialogOpen(false);
            setEditingOrder(null);
            fetchOrders(); // Refresh the list
        } catch (error) {
            console.error("Order update error:", error);
        }
    };

    // Handle delete order
    const handleDeleteOrder = (order) => {
        setDeletingOrder(order);
        setDeleteDialogOpen(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!deletingOrder) return;

        try {
            await deleteData(`/api/orders/${deletingOrder._id}`);
            setDeleteDialogOpen(false);
            setDeletingOrder(null);
            fetchOrders(); // Refresh the list
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    // Handle hide/show order (soft delete)
    const handleToggleOrderVisibility = async (order) => {
        try {
            await editData(`/api/orders/${order._id}/toggle-visibility`, {});
            fetchOrders(); // Refresh the list
        } catch (error) {
            console.error("Error hiding/showing order:", error);
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4">
                <h5 className='mb-0 d-flex align-items-center'>Order management</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label='breadcrumb' className='ml-auto breadcrumbs_'>
                        <StyledBreadcrumb
                            component="a"
                            href='#'
                            label="Order"
                            icon={<FaCartArrowDown fontSize="small" />}
                            deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>
                </div>
            </div>

            <div className='card shadow border-0 p-3'>
                <div className="orders-page-container">
                    {/* Filter Controls */}
                    <div className="orders-filters" style={{ marginBottom: '20px' }}>
                        {/* Top Row - Main Filters */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div className="filter-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Button
                                    variant={showHiddenOrders ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => setShowHiddenOrders(!showHiddenOrders)}
                                    startIcon={<i className={`fas ${showHiddenOrders ? 'fa-eye-slash' : 'fa-eye'}`}></i>}
                                >{showHiddenOrders? 'Hide hidden orders': 'Show hidden orders'}</Button>

                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    size="small"
                                    style={{ minWidth: '150px' }}
                                >
                                    <MenuItem value="all">All statuses</MenuItem>
                                    <MenuItem value="Unpaid">Pending payment</MenuItem>
                                    <MenuItem value="Paid">Paid</MenuItem>
                                    <MenuItem value="processing">Processing</MenuItem>
                                    <MenuItem value="shipped">Delivered</MenuItem>
                                    <MenuItem value="failed">Failed</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>

                                <input
                                    type="text"
                                    placeholder="Search by order code, customer name."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        minWidth: '250px'
                                    }}
                                />
                            </div>

                            <div className="orders-stats">
                                <span style={{ fontSize: '14px', color: '#6c757d' }}>
                                    Hiển thị: {getFilteredOrdersCount()} đơn hàng
                                    {orders.filter(o => o.isHidden).length > 0 && (
                                        <span style={{ marginLeft: '10px', color: '#ffc107' }}>
                                            ({orders.filter(o => o.isHidden).length} đã ẩn)
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Bottom Row - Date Range and Sort */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="date-filters" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>From date:</span>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    style={{
                                        padding: '6px 10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />

                                <span style={{ fontSize: '14px', color: '#666' }}>To date:</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    style={{
                                        padding: '6px 10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />

                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={clearFilters}
                                    startIcon={<i className="fas fa-times"></i>}
                                >Clear filter</Button>
                            </div>

                            <div className="sort-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>Sort by:</span>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    size="small"
                                    style={{ minWidth: '120px' }}
                                >
                                    <MenuItem value="dateCreated">Creation date</MenuItem>
                                    <MenuItem value="orderId">Order code</MenuItem>
                                    <MenuItem value="amount">Total amount</MenuItem>
                                    <MenuItem value="status">Status</MenuItem>
                                </Select>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    startIcon={<i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                                >{sortOrder === 'asc'? 'Ascending': 'Descending'}   </Button>
                            </div>
                        </div>
                    </div>
                    <div className="main-orders-wrapper">
                        <div className="row">
                            <div className="col-12">
                                <div className="orders-wrapper">
                                    {/* Desktop Table Layout */}
                                    <div className="orders-items-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Order code</th>
                                                    <th>Khách hàng</th>
                                                    <th>Product</th>
                                                    <th>Total amount</th>
                                                    <th>Status</th>
                                                    <th>Creation date</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ordersLoading ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <div className="loading-orders">
                                                                <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                                                                <h5>Loading orders.</h5>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : error ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <div className="error-orders">
                                                                <i className="fas fa-exclamation-triangle fa-2x text-danger mb-3"></i>
                                                                <h5>Data loading error</h5>
                                                                <p className="text-muted">{error}</p>
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={fetchOrders}
                                                                >Try again</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : orders.length > 0 ? (
                                                    orders
                                                        .filter(order => showHiddenOrders || !order.isHidden)
                                                        .map((order) => {
                                                            const statusInfo = getStatusColor(order.status);
                                                            return (
                                                                <tr key={order._id} className={`order-item ${order.isHidden ? 'hidden' : ''}`}>
                                                                    <td className="order-item-id">
                                                                        <div className="order-id-wrapper">
                                                                            <span className="order-id">#{order.orderId}</span>
                                                                        </div>
                                                                    </td>

                                                                    <td className="order-item-customer">
                                                                        <div className="customer-info">
                                                                            <div className="customer-name">{order.userId?.name || 'N/A'}</div>
                                                                            <div className="customer-contact">
                                                                                <small className="text-muted">{order.userId?.email || 'N/A'}</small><br />
                                                                                <small className="text-muted">{order.userId?.phone || 'N/A'}</small>
                                                                            </div>
                                                                            {order.address && (
                                                                                <div className="customer-address">
                                                                                    <small className="text-muted">
                                                                                        {order.address.details}
                                                                                        {order.address.city && `, ${order.address.city}`}
                                                                                        {order.address.moreInfo && (
                                                                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                                                                {order.address.moreInfo}
                                                                                            </div>
                                                                                        )}
                                                                                    </small>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>

                                                                    <td className="order-item-products">
                                                                        <button
                                                                            className="products-count-btn"
                                                                            onClick={() => handleOpenProducts(order.products)}
                                                                        >
                                                                            <i className="fas fa-box"></i>{order.products.length || 0} products</button>
                                                                    </td>

                                                                    <td className="order-item-amount">
                                                                        <span className="amount">{formatCurrency(order.amount)}</span>
                                                                    </td>

                                                                    <td className="order-item-status">
                                                                        <Select
                                                                            value={order.status}
                                                                            onChange={(e) => handleChangeStatus(order._id, e.target.value)}
                                                                            size="small"
                                                                            disabled={loading[order._id]}
                                                                            className="status-select"
                                                                            sx={{
                                                                                backgroundColor: statusInfo.bg,
                                                                                color: statusInfo.color,
                                                                                borderRadius: "8px",
                                                                                minWidth: "140px",
                                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                                    border: `1px solid ${statusInfo.color}`,
                                                                                },
                                                                            }}
                                                                        >
                                                                            <MenuItem value="Unpaid">Pending payment</MenuItem>
                                                                            <MenuItem value="Paid">Paid</MenuItem>
                                                                            <MenuItem value="processing">Processing</MenuItem>
                                                                            <MenuItem value="shipped">Delivered</MenuItem>
                                                                            <MenuItem value="failed">Failed</MenuItem>
                                                                            <MenuItem value="cancelled">Cancelled</MenuItem>
                                                                        </Select>
                                                                    </td>

                                                                    <td className="order-item-date">
                                                                        <span className="date">{formatDate(order.dateCreated)}</span>
                                                                    </td>

                                                                    <td className="order-item-actions">
                                                                        <div className="action-buttons">
                                                                            <button
                                                                                className="action-btn view-btn"
                                                                                onClick={() => handleOpenProducts(order.products)}
                                                                                title="View product details"
                                                                            >
                                                                                <i className="fas fa-eye"></i>
                                                                            </button>
                                                                            <button
                                                                                className="action-btn edit-btn"
                                                                                onClick={() => handleEditOrder(order)}
                                                                                title="Edit order"
                                                                            >
                                                                                <i className="fas fa-edit"></i>
                                                                            </button>
                                                                            <button
                                                                                className={`action-btn ${order.isHidden ? 'show-btn' : 'hide-btn'}`}
                                                                                onClick={() => handleToggleOrderVisibility(order)}
                                                                                title={order.isHidden ? "Show order" : "Hide order"}
                                                                            >
                                                                                <i className={`fas ${order.isHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                                                            </button>
                                                                            <button
                                                                                className="action-btn delete-btn"
                                                                                onClick={() => handleDeleteOrder(order)}
                                                                                title="Delete order"
                                                                            >
                                                                                <i className="fas fa-trash"></i>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <div className="empty-orders">
                                                                <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                                                                <h5>No orders yet</h5>
                                                                <p className="text-muted">Orders will appear here when customers place an order</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card Layout */}
                                    <div className="orders-items-mobile">
                                        {ordersLoading ? (
                                            <div className="loading-orders">
                                                <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                                                <h5>Loading orders.</h5>
                                            </div>
                                        ) : error ? (
                                            <div className="error-orders">
                                                <i className="fas fa-exclamation-triangle fa-2x text-danger mb-3"></i>
                                                <h5>Data loading error</h5>
                                                <p className="text-muted">{error}</p>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={fetchOrders}
                                                >Retry</button>
                                            </div>
                                        ) : orders.length > 0 ? (
                                            orders
                                                .filter(order => showHiddenOrders || !order.isHidden)
                                                .map((order) => {
                                                    const statusInfo = getStatusColor(order.status);
                                                    return (
                                                        <div key={order._id} className={`order-item-card ${order.isHidden ? 'hidden' : ''}`}>
                                                            <div className="order-item-card-header">
                                                                <div className="order-item-card-id">
                                                                    <h6 className="order-id">#{order.orderId}</h6>
                                                                    <span className="order-date">{formatDate(order.dateCreated)}</span>
                                                                </div>
                                                                <div className="order-item-card-amount">
                                                                    <span className="amount">{formatCurrency(order.amount)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="order-item-card-customer">
                                                                <div className="customer-info">
                                                                    <div className="customer-name">{order.userId?.name || 'N/A'}</div>
                                                                    <div className="customer-contact">
                                                                        <small>{order.userId?.email || 'N/A'}</small><br />
                                                                        <small>{order.userId?.phone || 'N/A'}</small>
                                                                    </div>
                                                                    {order.address && (
                                                                        <div className="customer-address">
                                                                            <small className="text-muted">
                                                                                {order.address.details}
                                                                                {order.address.city && `, ${order.address.city}`}
                                                                                {order.address.moreInfo && (
                                                                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                                                        {order.address.moreInfo}
                                                                                    </div>
                                                                                )}
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="order-item-card-details">
                                                                <div className="order-detail-group">
                                                                    <span className="order-detail-label">Product</span>
                                                                    <button
                                                                        className="products-count-btn mobile"
                                                                        onClick={() => handleOpenProducts(order.products)}
                                                                    >
                                                                        {order.products?.length || 0} sản phẩm
                                                                        {order.products && order.products.length > 0 && (
                                                                            <span style={{ fontSize: '9px', marginLeft: '2px' }}>
                                                                                ({order.products.filter(p => p.inkmeFile).length} 3D)
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <div className="order-detail-group">
                                                                    <span className="order-detail-label">Status</span>
                                                                    <Select
                                                                        value={order.status}
                                                                        onChange={(e) => handleChangeStatus(order._id, e.target.value)}
                                                                        size="small"
                                                                        disabled={loading[order._id]}
                                                                        sx={{
                                                                            backgroundColor: statusInfo.bg,
                                                                            color: statusInfo.color,
                                                                            borderRadius: "8px",
                                                                            minWidth: "120px",
                                                                            fontSize: "12px"
                                                                        }}
                                                                    >
                                                                        <MenuItem value="Unpaid">Pending payment</MenuItem>
                                                                        <MenuItem value="Paid">Paid</MenuItem>
                                                                        <MenuItem value="processing">Processing</MenuItem>
                                                                        <MenuItem value="shipped">Delivered</MenuItem>
                                                                        <MenuItem value="failed">Failed</MenuItem>
                                                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                            <div className="orderDialog displaying the product list                                                 <div className="action-buttons-mobile">
                                                                    <button
                                                                        className="action-btn view-btn mobile"
                                                                        onClick={() => handleOpenProducts(order.products)}
                                                                    >
                                                                        <i className="fas fa-eye"></i>View details</button>
                                                                    <button
                                                                        className="action-btn edit-btn mobile"
                                                                        onClick={() => handleEditOrder(order)}
                                                                    >
                                                                        <i className="fas fa-edit"></i>Edit</button>
                                                                    <button
                                                                        className={`action-btn mobile ${order.isHidden ? 'show-btn' : 'hide-btn'}`}
                                                                        onClick={() => handleToggleOrderVisibility(order)}
                                                                    >
                                                                        <i className={`fas ${order.isHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>{order.isHidden? 'Show': 'Hide'}  </button>
                                                                    <button
                                                                        className="action-btn delete-btn mobile"
                                                                        onClick={() => handleDeleteOrder(order)}
                                                                    >
                                                                        <i className="fas fa-trash"></i>
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <div className="empty-orders">
                                                <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                                                <h5>No orders yet</h5>
                                                <p className="text-muted">Orders will appear here when customers place an order</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>{/* Dialog displaying the product list */}<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Product details in order</span>
                            {selectedProducts.length > 0 && (
                                <span style={{
                                    backgroundColor: '#e9ecef',
                                    color: '#495057',
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 500
                                }}>
                                    {selectedProducts.filter(p => p.inkmeFile).length}/{selectedProducts.length} sản phẩm
                                </span>
                            )}
                        </div>
                    </DialogTitle>
                    <DialogContent>
                        <List>
                            {selectedProducts.map((product, index) => (
                                <ListItem key={index} style={{
                                    border: product.inkmeFile ? '2px solid #007bff' : '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    padding: '16px',
                                    backgroundColor: product.inkmeFile ? '#f8fbff' : 'white'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '15px' }}>
                                        {/* Product Image or InkMe File */}
                                        <div style={{ flexShrink: 0 }}>
                                            {(product.images && product.images.length > 0 && product.images[0] && product.images[0].trim() !== '') ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt="Product"
                                                    width="60"
                                                    height="60"
                                                    style={{
                                                        borderRadius: '8px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : product.inkmeFile ? (
                                                <div style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#f8f9fa',
                                                    border: '2px dashed #dee2e6',
                                                    borderRadius: '8px'
                                                }}>
                                                    <InkMeFile inkmeFile={product.inkmeFile} />
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#f8f9fa',
                                                    border: '2px dashed #dee2e6',
                                                    borderRadius: '8px',
                                                    color: '#6c757d',
                                                    fontSize: '12px',
                                                    textAlign: 'center'
                                                }}>
                                                    <i className="fas fa-image"></i>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <ListItemText
                                                primary={
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontWeight: 600, fontSize: '14px' }}>
                                                                {product.productTitle}
                                                            </span>

                                                        </div>
                                                        {product.inkmeFile && (
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: '#007bff',
                                                                fontWeight: 500,
                                                                marginTop: '4px'
                                                            }}>
                                                                <div>✨ 3D Design: {product.inkmeFile.sceneName || 'Custom Design'}</div>
                                                                {product.inkmeFile.color && (
                                                                    <div>Màu: {product.inkmeFile.color}</div>
                                                                )}
                                                                {product.inkmeFile.bgColor && (
                                                                    <div>Màu nền: {product.inkmeFile.bgColor}</div>
                                                                )}
                                                                {product.inkmeFile.acidWash > 0 && (
                                                                    <div>Acid Wash: {product.inkmeFile.acidWash}%</div>
                                                                )}
                                                                {product.inkmeFile.puffPrint > 0 && (
                                                                    <div>Puff Print: {product.inkmeFile.puffPrint}%</div>
                                                                )}
                                                                {product.inkmeFile.timestamp && (
                                                                    <div style={{ fontSize: '11px', color: '#666' }}>
                                                                        Tạo lúc: {new Date(product.inkmeFile.timestamp).toLocaleString('vi-VN')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                                secondary={
                                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                        <div>Quantity: {product.quantity}</div>
                                                        {product.price && (
                                                            <div>Giá: {formatCurrency(product.price)}</div>
                                                        )}
                                                        {product.subTotal && (
                                                            <div style={{ fontWeight: 600, color: '#28a745' }}>Total: {formatCurrency(product.subTotal)}</div>
                                                        )}
                                                        {product.classifications && product.classifications.length > 0 && (
                                                            <div style={{ marginTop: '8px' }}>
                                                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Details:</div>
                                                                {product.classifications.map((cls, clsIndex) => (
                                                                    <div key={clsIndex} style={{
                                                                        fontSize: '11px',
                                                                        color: '#888',
                                                                        marginTop: '2px',
                                                                        padding: '2px 6px',
                                                                        backgroundColor: '#f8f9fa',
                                                                        borderRadius: '4px',
                                                                        display: 'inline-block',
                                                                        marginRight: '4px'
                                                                    }}>
                                                                        {cls.name} (x{cls.quantity}) - {formatCurrency(cls.subTotal)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </div>
                                    </div>
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">Đóng</Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Order Dialog */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Edit order #{editingOrder.orderId}</DialogTitle>
                    <DialogContent>
                        {editingOrder && (
                            <div style={{ padding: '20px 0' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Order status:</label>
                                    <Select
                                        value={editingOrder.status}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                        fullWidth
                                        size="small"
                                    >
                                        <MenuItem value="Unpaid">Pending payment</MenuItem>
                                        <MenuItem value="Paid">Paid</MenuItem>
                                        <MenuItem value="processing">Processing</MenuItem>
                                        <MenuItem value="shipped">Delivered</MenuItem>
                                        <MenuItem value="failed">Failed</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </Select>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                        Ghi chú:
                                    </label>
                                    <textarea
                                        value={editingOrder.note || ''}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, note: e.target.value })}
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Add a note to the order."
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Total amount:</label>
                                    <input
                                        type="number"
                                        value={editingOrder.amount}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, amount: parseFloat(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                        Thông tin khách hàng:
                                    </label>
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}>
                                        <div><strong>Tên:</strong> {editingOrder.userId?.name || 'N/A'}</div>
                                        <div><strong>Email:</strong> {editingOrder.userId?.email || 'N/A'}</div>
                                        <div><strong>Phone number:</strong> {editingOrder.userId?.phone || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => handleSaveOrder(editingOrder)}
                            color="primary"
                            variant="contained"
                        >Save changes</Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Confirm order deletion</DialogTitle>
                    <DialogContent>
                        <p>Are you sure you want to delete order #{deletingOrder.orderId}?</p>
                        <p style={{ color: '#dc3545', fontSize: '14px' }}>
                            <i className="fas fa-exclamation-triangle"></i>This action cannot be undone!</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleConfirmDelete}
                            color="error"
                            variant="contained"
                        >
                            Xóa đơn hàng
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

// export default Orders;
export { Orders as InkMeOrders };
