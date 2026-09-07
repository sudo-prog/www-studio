import * as React from 'react'
import { Breadcrumbs, Chip, emphasize, styled } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MyContext } from '../../App';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from "@mui/material/Button";
import { FaCloudUploadAlt } from "react-icons/fa";
import CircularProgress from '@mui/material/CircularProgress';
import { postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';


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

const AddSubCat = () => {

    const [categoryValue, setCategoryValue] = useState('');
    const [loading, setLoading] = useState(false);

    const formdata = new FormData();
    const context = useContext(MyContext);

    const history = useNavigate();

    const [formFields, setFormFields] = useState({
        category: '',
        subCat: ''
    });

    const handleChangeCategory = (event) => {
        setCategoryValue(event.target.value);
        setFormFields(() => ({
            ...formFields,
            category: event.target.value
        }));
    };

    const inputChange = (e) => {
        setFormFields({
            ...formFields,
            [e.target.name]: e.target.value
        });
    }

    const addSubCat = (e) => {
        e.preventDefault();

        formdata.append('category', formFields.category);
        formdata.append('subCat', formFields.subCat);


        if (formFields.category == "") {
            context.setAlterBox({
                open: true,
                color: true,
                message: "Please select root category"
            });
            return false;
        }

        if (formFields.subCat == "") {
            context.setAlterBox({
                open: true,
                color: true,
                message: "Please enter subcategory"
            });
            return false;
        }

        postData('/api/subCat/create', formFields).then(res => {
            context.setAlterBox({
                open: true,
                error: false,
                message: "Subcategory added successfully"
            });
            setLoading(true);
            history('/subCategory'); 
        });
    }


    return (

        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4">
                <h5 className="mb-0">Add subcategory</h5>
                <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                    <StyledBreadcrumb
                        component="a"
                        href="#"
                        label="Dashboard"
                        icon={<HomeIcon fontSize="small" />}
                    />
                    <StyledBreadcrumb
                        label="Subcategory"
                        component="a"
                        href="#"
                    />
                    <StyledBreadcrumb
                        label="Add subcategory"
                    />
                </Breadcrumbs>
            </div>

            <form className='form' onSubmit={addSubCat}>
                <div className="row">
                    <div className="col-sm-9">
                        <div className="card p-4 mt-0">
                            <div className="row">
                                <div className="col">
                                    <div className="form-group">
                                        <h6>Category</h6>
                                        <Select
                                            value={categoryValue}
                                            onChange={handleChangeCategory}
                                            displayEmpty
                                            inputProps={{ 'aria-label': 'Without label' }}
                                            className="w-100"
                                            name="category"
                                        >
                                            <MenuItem value="">
                                                <em value={null}>-- Select category --</em>
                                            </MenuItem>

                                            {
                                                context.catData?.categoryList?.length !== 0 &&
                                                context.catData?.categoryList?.map((cat, index) => {
                                                    return (
                                                        <MenuItem className="text-capitalize"
                                                            value={cat.id} key={index}>{cat.name}
                                                        </MenuItem>
                                                    )
                                                })
                                            }
                                        </Select>
                                    </div>
                                </div>

                                <div className="col">
                                    <div className="form-group">
                                        <h6>Subcategory</h6>
                                        <input type="text" name="subCat"
                                            value={formFields.subCat} onChange={inputChange} />
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
        </div>
    )
}

// export default AddSubCat
export { StyledBreadcrumb as InkMeStyledBreadcrumb };
