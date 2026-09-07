import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Breadcrumbs, styled, emphasize, Select, MenuItem } from "@mui/material";
import { editData, fetchDataFromApi } from "../../utils/api";
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from "react-router-dom";
import { FaCartArrowDown } from "react-icons/fa6";


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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        fetchDataFromApi("/api/orders")
            .then((data) => {
                if (data && Array.isArray(data.ordersList)) {
                    const formattedOrders = data.ordersList.map((order) => ({
                        id: order._id,
                        orderId: order.orderId,
                        products: order.products || [],
                        fullName: order.fullname,
                        phoneNumber: order.phoneNumber,
                        email: order.email,
                        address: order.address,
                        amount: order.amount,
                        status: order.status,
                        dateCreated: new Date(order.dateCreated).toLocaleDateString("vi-VN"),
                    }));
                    setOrders(formattedOrders);
                }
            }).catch((error) => console.error("Order loading error:", error));
    }, []);

    const handleOpenProducts = (products) => {
        setSelectedProducts(products);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedProducts([]);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "pending": return { color: "warning", label: "Pending" }; // Màu vàng
            case "success": return { color: "success", label: "Thành công" }; // Màu xanh lá
            case "failed": return { color: "error", label: "Failed" }; //Red
            default: return { color: "default", label: "Unknown" };
        }
    };

    const handleChangeStatus = (id, orderStatus) => {
        fetchDataFromApi(`/api/orders/${id}`).then((data) => {

            const orders = {
                fullname: data.fullname,
                email: data.email,
                phoneNumber: data.phoneNumber,
                city: data.city,
                address: data.address,
                note: data.note,
                amount: parseInt(data.amount),
                products: data.products,
                orderId: data.orderId,
                userId: data.userId,
                status: orderStatus
            }


            editData(`/api/orders/${id}`, orders)
                .then((response) => {
                   
                        fetchDataFromApi("/api/orders")
                            .then((data) => {
                                if (data && Array.isArray(data.ordersList)) {
                                    const formattedOrders = data.ordersList.map((order) => ({
                                        id: order._id,
                                        orderId: order.orderId,
                                        products: order.products || [],
                                        fullName: order.fullname,
                                        phoneNumber: order.phoneNumber,
                                        email: order.email,
                                        address: order.address,
                                        amount: order.amount,
                                        status: order.status,
                                        dateCreated: new Date(order.dateCreated).toLocaleDateString("vi-VN"),
                                    }));

                                    setOrders(formattedOrders);
                                }
                            }).catch((error) => console.error("Order loading error:", error));
                    
                }).catch((error) => console.error("Order creation error:", error));
        })
    };

    const columns = [
        { field: 'id', headerName: 'OrderId', width: 100 },
        {
            field: "productCount",
            headerName: "Product quantity",
            width: 145,
            renderCell: (params) => (
                <Button variant="contained" color="primary" onClick={() => handleOpenProducts(params.row.products)}>
                    {params.row.products.length}
                </Button>
            ),
        },
        { field: 'fullName', headerName: 'Full name', width: 130 },
        {
            field: 'phoneNumber',
            description: 'Phone Number',
            sortable: false,
            headerName: 'Phone number', width: 130
        },
        {
            field: 'email',
            description: 'Email',
            sortable: false,
            headerName: 'Email', width: 130
        },
        {
            field: 'address',
            description: 'Address',
            sortable: false,
            headerName: 'Address', width: 130
        },
        {
            field: 'amount',
            headerName: 'Order value',
            type: 'number',
            width: 130,
        },
        {
            field: 'dateCreated',
            headerName: 'Created date',
            width: 130
        },
        {
            field: "status",
            headerName: "Status",
            width: 150,
            renderCell: (params) => (
                <Select
                    value={params.value}
                    onChange={(e) => handleChangeStatus(params.row.id, e.target.value)}
                    size="small"
                    sx={{
                        backgroundColor:
                            params.value === "pending" ? "yellow" :
                                params.value === "success" ? "lightgreen" :
                                    params.value === "failed" ? "lightcoral" : "white",
                        borderRadius: "5px",
                    }}
                >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="success">Thành công</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                </Select>
            ),
        },
        // {
        //     field: 'fullName',
        //     headerName: 'Full name',
        //     description: 'This column has a value getter and is not sortable.',
        //     sortable: false,
        //     width: 160,
        //     valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
        // },
    ];

    const paginationModel = { page: 0, pageSize: 10 };

    return (

        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4">
                <h5 className='mb-0 d-flex align-items-center'>Order list</h5>

                <div className="ml-auto d-flex align-items-center">

                    <Breadcrumbs aria-label='breadcrumb' className='ml-auto breadcrumbs_' >
                        <StyledBreadcrumb
                            component="a"
                            href=Dialog displaying product listl="Order"
                            icon={<FaCartArrowDown fontSize="small" />}
                            deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>


                </div>
            </div>

            <div className='card shadow border-0 p-3'>
                <section className="section" sx={{ marginTop: "100px" }}>
                    <div sx={{ height: 400, width: '100%' }}>

                        <Paper sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={orders}
                                columns={columns}
                                initialState={{ pagination: { paginationModel } }}
                                pageSizeOptions={[10, 30, 100]}
                                checkboxSelection
                                sx={{ border: 0 }}
                            />

                            {/* Dialog hiển thị danh sách sản phẩm */}
                            <Dialog open={open} onClose={handleClose}>
                               <div className="">
 <table className="">
 <thead>
 <tr>
 <th scope="">No.</th>
 <th scope="">ID</th>
 <th scope="">Total amount</th>
 <th scope="">Status</th>
 <th scope="">Action</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <th scope="">1</th>
 <td>1</td>
 <td>100,000</td>
 <td>Pending</td>
 <td><button className="">Details</button></td>
 </tr>
 </tbody>
 </table>
 </div>          </DialogActions>
                            </Dialog>
                        </Paper>
                        {/* <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">STT</th>
                                <th scope="col">ID</th>
                                <th scope="col">Total amount</th>
                                <th scope="col">Trạng thái</th>
                                <th scope="col">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td>1</td>
                                <td>100.000</td>
                                <td>Pending</td>
                                <td><button className="btn btn-primary">Details</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div> */}
                    </div>

                </section>
            </div>

        </div>


    )

};

// export default Orders;
export { Orders as InkMeOrders };
