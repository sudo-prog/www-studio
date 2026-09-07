import * as React from 'react';
import { Breadcrumbs, Chip, emphasize, OutlinedInput, styled } from "@mui/material"
import HomeIcon from "@mui/icons-material/Home";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Rating from "@mui/material/Rating";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import { IoCloseSharp } from "react-icons/io5";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaRegImages } from "react-icons/fa6";
import { deleteData, deleteImages, fetchDataFromApi, postData } from "../../utils/api";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(name, personName, theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
    };
}


const ProductUpload = () => {

    const [categoryValue, setCategoryValue] = useState('');
    const [subCategoryValue, setSubCategoryValue] = useState('');
    const [ratingsValue, setRatingsValue] = React.useState(0);
    const [isFeaturedValue, setisFeaturedValue] = React.useState(true);

    const [catData, setCatData] = useState([]);
    const [subCatData, setSubCatData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [productRams, setProductRams] = useState([]);
    const [productWeight, setProductWeight] = useState('');
    const [productSize, setProductSize] = useState([]);
    const [productRamsData, setProductRamsData] = useState([]);
    const [productSizeData, setProductSizeData] = useState([]);

    const history = useNavigate();
    const context = useContext(MyContext);
    const formdata = new FormData();

    const [disable, setDisable] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState([]);

    const [formFields, setformFields] = useState({
        name: "",
        description: "",
        images: [],
        brand: "",
        price: null,
        oldPrice: null,
        discount: null,
        category: "",
        catName: "",
        subCatId: "",
        subCat: "",
        countInStock: null,
        rating: 0,
        productRams: [],
        productSize: [],
        productWeight: "",
        isFeatured: true
    });

    const handleChangeCategory = (event) => {
        setCategoryValue(event.target.value);
        setformFields(() => ({
            ...formFields,
            category: event.target.value
        }));
    };

    const handleChangeSubCategory = (event) => {
        setSubCategoryValue(event.target.value);
        setformFields(() => ({
            ...formFields,
            subCat: event.target.value
        }));

        formFields.subCatId = event.target.value;

    };

    const handleChangeProductRams = (event) => {
        // setProductRams(event.target.value);
        // setformFields(() => ({
        //     ...formFields,
        //     productRams: event.target.value
        // }));

        const {
            target: { value },
        } = event;
        setProductRams(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );

        //Update formFields with new productRams array
        setformFields((prevFields) => ({
            ...prevFields,
            productRams: typeof value === 'string' ? value.split(',') : value,
        }));

    };

    const handleChangeProductSize = (event) => {
        // setProductSize(event.target.value);
        // setformFields(() => ({
        //     ...formFields,
        //     productSize: event.target.value
        // }));

        const {
            target: { value },
        } = event;
        setProductSize(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );

        //Update formFields with new productSize array
        setformFields((prevFields) => ({
            ...prevFields,
            productSize: typeof value === 'string' ? value.split(',') : value,
        }));

    };


    const handleChangeisFeaturedValue = (event) => {
        setisFeaturedValue(event.target.value);
        setformFields(() => ({
            ...formFields,
            isFeatured: event.target.value
        }));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        setCatData(context.catData);
        setSubCatData(context.subCatData);

        fetchDataFromApi("/api/imageUpload/").then((res) => {
            res?.map((item) => {
                item?.images?.map((img) => {
                    deleteImages(`/api/category/deleteImage?img=${img}`).then((res) => {
                        deleteData("/api/imageUpload/deleteAllImages");
                    })
                })
            })
        });

        fetchDataFromApi("/api/productSize/").then((res) => {
            setProductSizeData(res);
        });

        fetchDataFromApi("/api/productRams/").then((res) => {
            setProductRamsData(res);
        });

    }, []);

    const inputChange = (e) => {
        setformFields({
            ...formFields,
            [e.target.name]: e.target.value
        });
    }

    const selectCat = (cat) => {
        setformFields((prev) => ({
            ...prev,
            catName: cat
        }));
    };




    const removeImg = async (index, imgUrl) => {
        const imgIndex = preview.indexOf(imgUrl);

        deleteImages(`/api/category/deleteImage?img=${imgUrl}`).then((res) => {
            context.setAlterBox({
                open: true,
                error: false,
                message: "Image deleted successfully"
            })
        })

        if (imgIndex > -1) {
            preview.splice(index, 1);
        }
    }

    let img_arr = [];
    let uniqueArray = [];

    const onChangeFile = async (e, apiEndPoint) => {
        try {

            const files = e.target.files;

            setUploading(true);

            for (var i = 0; i < files.length; i++) {

                // validate file type
                if (files[i] && (files[i].type === 'image/jpeg' ||
                    files[i].type === 'image/png' ||
                    files[i].type === 'image/gif' ||
                    files[i].type === 'image/jpg' ||
                    files[i].type === 'image/webp')) {

                    const file = files[i];
                    formdata.append(`images`, file);

                } else {
                    context.setAlterBox({
                        open: true,
                        color: true,
                        message: "Please choose an image in the correct format (jpeg, png, gif, jpg, webp)"
                    });
                    return false;
                }
            }

        } catch (error) {
            console.log(error);
        }

        postData(apiEndPoint, formdata).then((res) => {

            fetchDataFromApi("/api/imageUpload").then((response) => {
                if (response !== undefined && response !== null && response !== "" && response.length !== 0) {

                    response.length !== 0 && response.map((item) => {
                        item?.images.length !== 0 && item?.images?.map((img) => {
                            img_arr.push(img);

                        })
                    })

                    const uniqueArray = img_arr.filter((item, index) => img_arr.indexOf(item) === index);

                    const appendedArray = [...preview, ...uniqueArray];

                    setPreview(appendedArray);
                    setTimeout(() => {
                        setUploading(false);
                        img_arr = [];
                        context.setAlterBox({
                            open: true,
                            error: false,
                            message: "Image added successfully"
                        })
                    }, 200);
                }
            });

        });

    }

    const addProduct = (e) => {
        e.preventDefault();
        setLoading(true);

        const appendedArray = [...preview, ...uniqueArray];

        img_arr = [];

        formdata.append('name', formFields.name);
        formdata.append('description', formFields.description);
        formdata.append('brand', formFields.brand);
        formdata.append('price', formFields.price);
        formdata.append('oldPrice', formFields.oldPrice);
        formdata.append('discount', formFields.discount);
        formdata.append('countInStock', formFields.countInStock);
        formdata.append('catName', formFields.catName);
        formdata.append('subCatId', formFields.subCatId);
        formdata.append('category', formFields.category);
        formdata.append('subCat', formFields.subCat);
        formdata.append('rating', formFields.rating);
        formdata.append('isFeatured', formFields.isFeatured);
        formdata.append('productRams', formFields.productRams);
        formdata.append('productSize', formFields.productSize);
        formdata.append('productWeight', formFields.productWeight);

        formFields.images = appendedArray;

        // -------------- if ermpty
        if (formFields.name === "") {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter the product name"
            });
            setLoading(false);
            return false;
        }

        if (formFields.description === "") {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter the product description"
            });
            setLoading(false);
            return false;
        }

        if (formFields.category === "") {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please select a product category"
            });
            setLoading(false);
            return false;
        }

        // if (formFields.subCat === "") {
        //     context.setAlterBox({
        //         open: true,
        //         error: true,
        //Message: "Please select the product's subcategory"
        //     });
        //     setLoading(false);
        //     return false;
        // }

        if (formFields.price === null || formFields.price <= 0 || !/^\d+(\.\d+)?$/.test(formFields.price)) {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter the product price as a number greater than 0 and without special characters or letters"
            });
            setLoading(false);
            return false;
        }

        if (formFields.oldPrice === null || formFields.oldPrice <= 0 || !/^\d+(\.\d+)?$/.test(formFields.price)) {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter the old product price as a number greater than 0 and without special characters or letters"
            });
            setLoading(false);
            return false;
        }

        if (formFields.countInStock === null || formFields.countInStock <= 0 || !/^\d+(\.\d+)?$/.test(formFields.countInStock)) {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter product quantity"
            });
            setLoading(false);
            return false;
        }

        // if (formFields.images.length === 0) {
        //     context.setAlterBox({
        //         open: true,
        //         error: true,
        //Message: "Please select at least one image"       //     });
        //     setLoading(false);
        //     return false;
        // }
        //--------------  if empty

        postData('/api/products/create', formFields).then((res) => {

            context.setAlterBox({
                open: true,
                error: false,
                message: "Product listed successfully"
            });

            deleteData('/api/imageUpload/deleteAllImages');
            setLoading(false);

            history('/products');
        })
    }

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4">
                    <h5 className="mb-0">Add Product</h5>
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Home"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Product"
                            component="a"
                            href="#"
                        />
                        <StyledBreadcrumb
                            label="Add Product"
                        />
                    </Breadcrumbs>
                </div>

                <form className="form" onSubmit={addProduct}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card shadow border-0 p-4 mt-0">
                                <h5 className="mb-4">Basic Information</h5>

                                <div className="form-group">
                                    <h6>Product Name</h6>
                                    <input type="text"
                                        name="name" value={formFields.name} onChange={inputChange} />
                                </div>

                                <div className="form-group">
                                    <h6>Description</h6>
                                    <textarea row={5} col={10}
                                        name="description" value={formFields.description} onChange={inputChange} />
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Category</h6>
                                            <Select
                                                value={formFields.category}
                                                onChange={(e) => {
                                                    const selectedCategory = context.catData?.categoryList?.find(cat => cat.id === e.target.value);
                                                    setformFields(prev => ({
                                                        ...prev,
                                                        category: e.target.value,
                                                        catName: selectedCategory?.name || ""
                                                    }));
                                                }}
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                className="w-100"
                                            >
                                                <MenuItem value="">
                                                    <em value={null}>-- Select category --</em>
                                                </MenuItem>

                                                {context.catData?.categoryList?.map((cat, index) => (
                                                    <MenuItem key={index} value={cat.id}>
                                                        {cat.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>

                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Sub Category</h6>
                                            <Select
                                            <div className="">
 <div className="">
 <h6>Brand</h6>
 <input type=""
 Name="" value={formFields.brand} onChange={inputChange} />
 </div>
 </div>                            <MenuItem value="">
                                                    <em value={null}>-- Select sub-category --</em>
                                                </MenuItem>

                                                {
                                                    context.subCatData?.subCategoryList?.length !== 0 &&
                                                    context.subCatData?.subCategoryList?.map((subCat, index) => {
                                                        return (
                                                            <MenuItem className="text-capitalize"
                                                                value={subCat.id} key={index}>{subCat.subCat}
                                                    </MenuItem>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        </div>
                                    </div>


                                    {/* <div className="col">
                                        <div className="form-group">
                                            <h6>Brand</h6>
                                            <input type="text"
                                                name="brand" value={formFields.brand} onChange={inputChange} />
                                        </div>
                                    </div> */}
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Giá bán</h6>
                                            <input type="text"
                                                name="price" value={formFields.price} onChange={inputChange} />
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Old price</h6>
                                            <input type="text"
                                                name="oldPrice" value={formFields.oldPrice} onChange={inputChange} />
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Discount</h6>
                                            <input type="text"
                                                name="discount" value={formFields.discount} onChange={inputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Post for sale</h6>
                                            <Select
                                                value={isFeaturedValue}
                                                onChange={handleChangeisFeaturedValue}
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                className="w-100"
                                            >
                                                <MenuItem className="text-capitalize" selected value={true}>Post</MenuItem>
                                                <MenuItem className="text-capitalize" value={false}>Save draft</MenuItem>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Quantity</h6>
                                            <input type="text"
                                                name="countInStock" value={formFields.countInStock} onChange={inputChange} />
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Brand</h6>
                                            <input type="text"
                                                name="brand" value={formFields.brand} onChange={inputChange} />
                                        </div>
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <h6>PRODUCT RAMS</h6>
                                            <Select
                                                multiple
                                                value={productRams}
                                                onChange={handleChangeProductRams}
                                                displayEmpty
                                                // input={<OutlinedInput label="Name" />}
                                                MenuProps={MenuProps}
                                                className="w-100"
                                            >

                                                {
                                                    productRamsData?.map((item, index) => {
                                                        return (
                                                            <MenuItem className="text-capitalize"
                                                                value={item.productRams}>{item.productRams}
                                                            </MenuItem>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Weight</h6>
                                            <input type="text"
                                                name="productWeight" value={formFields.productWeight} onChange={inputChange} />
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Size</h6>
                                            <Select
                                                multiple
                                                value={productSize}
                                                onChange={handleChangeProductSize}
                                                displayEmpty
                                                // input={<OutlinedInput label="Name" />}
                                                MenuProps={MenuProps}
                                                className="w-100"
                                            >

                                                {
                                                    productSizeData?.map((item, index) => {
                                                        return (
                                                            <MenuItem
                                                                value={item.productSize}>{item.productSize}
                                                            </MenuItem>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Review</h6>
                                            <Rating
                                                name="simple-controlled"
                                                value={ratingsValue}
                                                onChange={(event, newValue) => {
                                                    setRatingsValue(newValue);
                                                    setformFields(() => ({
                                                        ...formFields,
                                                        rating: newValue

                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div >

                        <div className="col-md-12">
                            <div className="card shadow border p-4 mt-0">
                                <div className="imageUploadSec">
                                    <h5 className="mb-4">Add product images</h5>
                                    <div className="imgUploadBox d-flex align-items-center">
                                        {
                                            preview?.length !== 0 && preview?.map((img, index) => {
                                                return (
                                                    <div className="uploadBox" key={index}>
                                                        <span className="remove" onClick={() => removeImg(index, img)}><IoCloseSharp /></span>
                                                        <div className="box">
                                                            <LazyLoadImage
                                                                alt="image"
                                                                effect="blur"
                                                                className="w-100"
                                                                src={img}
                                                            />
                                         <div className="">
 <div className="">
 {
 ProductImagesArray.length!== 0 &&
 <h4>Product images</h4>
 }
 <div className="" id="">
 {
 ProductImagesArray.map((image, index) => {
 Return (
 <div className="" key={index}>
 <img src={image} alt="" className="" />
 </div>
 )
 })
 }

 </div>
 </div>
 </div>                     <>
                                                        <input type="file" multiple name="images"
                                                            onChange={(e) => onChangeFile(e, `/api/products/upload`)} />
                                                        <div className="info">
                                                            <FaRegImages />
                                                            <h5>Thêm ảnh</h5>
                                                        </div>
                                                    </>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <br />

                                <Button type="submit" className="btn-blue btn-lg btn-big">
                                    <FaCloudUploadAlt /> &nbsp;
                                    {loading === true ? <CircularProgress color='inherit'
                                        className='loader ml-2' /> : 'Post for sale'}
                                </Button>
                            </div>


                        </div>

                        {/* <div className="col-sm-3">
                            <div className="stickyBox">
                                {
                                    productImagesArray?.length !== 0 &&
                                    <h4>Ảnh sản phẩm</h4>
                                }
                                <div className="imgGrid d-flex" id="imgGrid">
                                    {
                                        productImagesArray?.map((image, index) => {
                                            return (
                                                <div className="img" key={index}>
                                                    <img src={image} alt="images" className="w-100" />
                                                </div>
                                            )
                                        })
                                    }

                                </div>
                            </div>
                        </div> */}

                    </div>

                </form >

            </div >
        </>
    )
}

// export default ProductUpload;
export { ProductUpload as InkMeProductUpload };
