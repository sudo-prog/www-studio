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

const AddProductRams = () => {

    const [categoryValue, setCategoryValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [productRamsData, setProductRamsData] = useState([]);
    const [editId, setEditId] = useState('');

    const formdata = new FormData();
    const context = useContext(MyContext);

    const history = useNavigate();

    const [formFields, setFormFields] = useState({
        productRams: ''
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
        fetchDataFromApi('/api/productRams').then((res) => {
            setProductRamsData(res);
        })
    }, []);

    const deleteItem = (id) => {
        deleteData(`/api/productRams/${id}`).then((res) => {
            fetchDataFromApi('/api/productRams').then((res) => {
                setProductRamsData(res);
            })
        })
    }

    const editItem = (id) => {
        fetchDataFromApi(`/api/productRams/${id}`).then((res) => {
            setEditId(id);
            setFormFields({
                productRams: res.productRams
            })
        })
    }

    const addProductRams = (e) => {
        e.preventDefault();

        formdata.append('productRams', formFields.productRams);


        if (formFields.productRams == "") {
            context.setAlterBox({
                open: true,
                color: true,
                message: "Please enter product RAMs"
            });
            return false;
        }

        setLoading(true);

        if (editId === "") {
            postData('/api/productRams/create', formFields).then(res => {
                context.setAlterBox({
                    open: true,
                    error: false,
                    message: "Thêm product rams thành công"
                });
                setLoading(false);
                setFormFields({
                    productRams: ''
                });

                fetchDataFromApi('/api/productRams').then((res) => {
                    setProductRamsData(res);
                    context.setProgress(100);
                })

            });
        } else {
            editData(`/api/productRams/${editId}`, formFields).then((res) => {
                fetchDataFromApi('/api/productRams').then((res) => {
                    setProductRamsData(res);
                    setEditId("");
                    context.setProgress(100);
                    setLoading(false);
                    setFormFields({
                        productRams: ''
                    });
                })
            })
        }
    }


    return (

        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4">
                <h5 className="mb-0">Add product RAMs</h5>
                <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                    <StyledBreadcrumb
                        component="a"
                        href="#"
                        label="Dashboard"
                        icon={<HomeIcon fontSize="small" />}
                    />
                    <StyledBreadcrumb
                        label="Product RAMs"
                        component="a"
                        href="#"
                    />
                    <StyledBreadcrumb
                        label="Add product RAMs"
                    />
                </Breadcrumbs>
            </div>

            <form className='form' onSubmit={addProductRams}>
                <div className="row">
                    <div className="col-sm-10">
                        <div className="card p-4 mt-0">
                            <div className="row">
                                <div className="col">
                                    <div className="form-group">
                                        <h6>Product Rams</h6>
                                        <input type="text" name="productRams" className="form-control"
                                            value={formFields.productRams} onChange={inputChange} />
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
                productRamsData.length !== 0 &&
                <div className="row">
                    <div className="col-md-10">
                        <div className="card p-4 mt-0">
                            <div className='table-responsive mt-3'>
                                <table className='table table-bordered v-align'>
                                    <thead className='thead-dark'>
                                        <tr>
                                            <th>#ID</th>
                                            <th>PRODUCT RAMS</th>
                                            <th width="25%">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {
                                            productRamsData?.map((item, index) => {
                                                return (
                                                    <tr>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Checkbox /> <span>#{index + 1}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <span>{item.productRams}</span>
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

// export default AddProductRams
export { StyledBreadcrumb as InkMeStyledBreadcrumb };
