import * as React from 'react'
import { Breadcrumbs, Chip, emphasize, styled } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MyContext } from '../../App';
import Button from "@mui/material/Button";
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from '@mui/material/CircularProgress';
import { deleteData, editData, fetchDataFromApi, postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa6';
import { FaPencilAlt } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';


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

const AddProductSize = () => {

    const [categoryValue, setCategoryValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [productSizeData, setProductSizeData] = useState([]);
    const [editId, setEditId] = useState('');

    const formdata = new FormData();
    const context = useContext(MyContext);

    const history = useNavigate();

    const [formFields, setFormFields] = useState({
        productSize: ''
    });

    const inputChange = (e) => {
        setFormFields({
            ...formFields,
            [e.target.name]: e.target.value
        });
    }

    const handleChange = (event, value) => {
        context.setProgress(40);
        fetchDataFromApi(`/api/products?page=${value}`).then((res) => {
            console.log(res);
            context.setProgress(100);
        })
    };

    useEffect(() => {
        fetchDataFromApi('/api/productSize').then((res) => {
            setProductSizeData(res);
        })
    }, []);

    const deleteItem = (id) => {
        deleteData(`/api/productSize/${id}`).then((res) => {
            fetchDataFromApi('/api/productSize').then((res) => {
                setProductSizeData(res);
            })
        })
    }

    const editItem = (id) => {
        fetchDataFromApi(`/api/productSize/${id}`).then((res) => {
            setEditId(id);
            setFormFields({
                productSize: res.productSize
            })
        })
    }

    const AddProductSize = (e) => {
        e.preventDefault();

        formdata.append('productSize', formFields.productSize);


        if (formFields.productSize == "") {
            context.setAlterBox({
                open: true,
                color: true,
                message: "Please enter product size"
            });
            return false;
        }

        setLoading(true);

        if (editId === "") {
            postData('/api/productSize/create', formFields).then(res => {
                context.setAlterBox({
                    open: true,
                    error: false,
                    message: "Thêm product Size thành công"
                });
                setLoading(false);
                setFormFields({
                    productSize: ''
                });

                fetchDataFromApi('/api/productSize').then((res) => {
                    setProductSizeData(res);
                    context.setProgress(100);
                })

            });
        } else {
            editData(`/api/productSize/${editId}`, formFields).then((res) => {
                fetchDataFromApi('/api/productSize').then((res) => {
                    setProductSizeData(res);
                    setEditId("");
                    context.setProgress(100);
                    setLoading(false);
                    setFormFields({
                        productSize: ''
                    });
                })
            })
        }
    }


    return (

        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4">
                <h5 className="mb-0">Add product size</h5>
                <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                    <StyledBreadcrumb
                        component="a"
                        href="#"
                        label="Dashboard"
                        icon={<HomeIcon fontSize="small" />}
                    />
                    <StyledBreadcrumb
                        label="Product size"
                        component="a"
                        href="#"
                    />
                    <StyledBreadcrumb
                        label="Add product size"
                    />
                </Breadcrumbs>
            </div>

            <form className='form' onSubmit={AddProductSize}>
                <div className="row">
                    <div className="col-sm-10">
                        <div className="card p-4 mt-0">
                            <div className="row">
                                <div className="col">
                                    <div className="form-group">
                                        <h6>Product Size</h6>
                                        <input type="text" name="productSize" className="form-control"
                                            value={formFields.productSize} onChange={inputChange} />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="btn-blue btn-lg btn-big">
                                <FaCloudUploadAlt /> &nbsp;
                                {loading === true ? <CircularProgress color='inherit'
                                    className='loader ml-2' /> : 'Confirm'}
                            </Button>
                        </div>
                    </div>
                </div>

            </form>

            {
                productSizeData.length !== 0 &&
                <div className="row">
                    <div className="col-md-10">
                        <div className="card p-4 mt-0">
                            <div className='table-responsive mt-3'>
                                <table className='table table-bordered v-align'>
                                    <thead className='thead-dark'>
                                        <tr>
                                            <th>#ID</th>
                                            <th>PRODUCT Size</th>
                                            <th width="25%">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {
                                            productSizeData?.map((item, index) => {
                                                return (
                                                    <tr>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Checkbox /> <span>#{index + 1}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <span>{item.productSize}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className='actions d-flex align-items-center justify-content-center'>

                                                                <Button className='success' color='success'
                                                                    onClick={() => editItem(item.id)}><FaPencilAlt />
                                                                </Button>

                                                                <Button className='error' color='error'
                                                                    onClick={() => deleteItem(item.id)}
                                                                ><MdDelete />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }



                                    </tbody>

                                </table>

                                {
                                    // productList?.totalPages > 1 &&
                                    < div className="d-flex tableFooter">
                                        <p>showing <b>12</b> of <b>100</b> results </p>
                                        <Pagination className='pagination' onChange={handleChange}
                                            color='primary' showFirstButton showLastButton />
                                    </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
            }

        </div>
    )
}

// export default AddProductSize;
export { AddProductSize as InkMeAddProductSize };
