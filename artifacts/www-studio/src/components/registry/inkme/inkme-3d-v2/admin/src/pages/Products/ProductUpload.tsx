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

    const [productWeight, setProductWeight] = useState('');
    const [productSize, setProductSize] = useState([]);
    const [productColor, setProductColor] = useState([]);
    const [productSizeData, setProductSizeData] = useState([]);
    const [productColorData, setProductColorData] = useState([]);

    //State for temporary input
    const [newSizeInput, setNewSizeInput] = useState('');
    const [newColorInput, setNewColorInput] = useState('');

    // Product Classifications
    const [productClassify, setProductClassify] = useState([]);

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
        price: 0,
        originalPrice: 0,
        discountPercent: 0,
        oldPrice: null, //Keep for compatibility
        discount: null, //Keep for compatibility
        category: "",
        catName: "",
        subCatId: "",
        subCat: "",
        countInStock: null,
        rating: 0,
        productSize: [],
        productColor: [],
        productWeight: "",
        productClassify: [],
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

    const handleChangeProductSize = (event) => {
        const {
            target: { value },
        } = event;
        setProductSize(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );

        //Update formFields with a new productSize array
        setformFields((prevFields) => ({
            ...prevFields,
            productSize: typeof value === 'string' ? value.split(',') : value,
        }));

    };

    const handleChangeProductColor = (event) => {
        const {
            target: { value },
        } = event;
        setProductColor(
            typeof value === 'string' ? value.split(',') : value,
        );

        setformFields((prevFields) => ({
            ...prevFields,
            productColor: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleChangeisFeaturedValue = (event) => {
        setisFeaturedValue(event.target.value);
        setformFields(() => ({
            ...formFields,
            isFeatured: event.target.value
        }));
    };

    //Handle Product Classify
    const addProductClassify = () => {
        const newClassify = {
            name: "",
            image: "",
            quantity: 0,
            price: 0
        };
        setProductClassify([...productClassify, newClassify]);
        setformFields(prev => ({
            ...prev,
            productClassify: [...prev.productClassify, newClassify]
        }));
    };

    const removeProductClassify = (index) => {
        const updatedClassify = productClassify.filter((_, i) => i !== index);
        setProductClassify(updatedClassify);
        setformFields(prev => ({
            ...prev,
            productClassify: updatedClassify
        }));
    };

    const updateProductClassify = (index, field, value) => {
        const updatedClassify = [...productClassify];
        updatedClassify[index] = { ...updatedClassify[index], [field]: value };
        setProductClassify(updatedClassify);
        setformFields(prev => ({
            ...prev,
            productClassify: updatedClassify
        }));
    };

    //Size handler function
    const addProductSize = () => {
        if (newSizeInput.trim() && !productSize.includes(newSizeInput.trim())) {
            const updatedSizes = [...productSize, newSizeInput.trim()];
            setProductSize(updatedSizes);
            setformFields(prev => ({
                ...prev,
                productSize: updatedSizes
            }));
            setNewSizeInput('');
        }
    };

    const removeProductSize = (indexToRemove) => {
        const updatedSizes = productSize.filter((_, index) => index !== indexToRemove);
        setProductSize(updatedSizes);
        setformFields(prev => ({
            ...prev,
            productSize: updatedSizes
        }));
    };

    //Color handler function
    const addProductColor = () => {
        if (newColorInput.trim() && !productColor.includes(newColorInput.trim())) {
            const updatedColors = [...productColor, newColorInput.trim()];
            setProductColor(updatedColors);
            setformFields(prev => ({
                ...prev,
                productColor: updatedColors
            }));
            setNewColorInput('');
        }
    };

    const removeProductColor = (indexToRemove) => {
        const updatedColors = productColor.filter((_, index) => index !== indexToRemove);
        setProductColor(updatedColors);
        setformFields(prev => ({
            ...prev,
            productColor: updatedColors
        }));
    };

    //Enter key handler function
    const handleSizeKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addProductSize();
        }
    };

    const handleColorKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addProductColor();
        }
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
        }).catch((error) => {
            console.error("Error fetching image upload data:", error);
        });

        fetchDataFromApi("/api/productSize/").then((res) => {
            setProductSizeData(res);
        }).catch((error) => {
            console.error("Error fetching product size data:", error);
            setProductSizeData([]);
        });

        //Assume there is an API for productColor, otherwise use default data
        const defaultColors = [
            { productColor: "Red" },
            { productColor: "Xanh" },
            { productColor: "Vàng" },
            { productColor: "Black" },
            { productColor: "White" },
            { productColor: "Xám" },
            { productColor: "Nâu" },
            { productColor: "Pink" }
        ];
        setProductColorData(defaultColors);

    }, []);

    const inputChange = (e) => {
        setformFields({
            ...formFields,
            [e.target.name]: e.target.value
        });
    }

    //Automatic price calculation function (price is always entered manually)
    const calculatePricing = (changedField, value, currentFields) => {
        const numValue = parseFloat(value) || 0;
        const updatedFields = { ...currentFields };

        switch (changedField) {
            case 'price':
                updatedFields.price = numValue;
                //When changing price, calculate originalPrice or discountPercent
                if (updatedFields.discountPercent > 0 && numValue > 0) {
                    //If there is a discount percentage, calculate the original price
                    updatedFields.originalPrice = (numValue / (1 - updatedFields.discountPercent / 100)).toFixed(2);
                }
                else if (updatedFields.originalPrice > 0 && numValue > 0) {
                    //If there is an original price, calculate the discount %
                    updatedFields.discountPercent = (((updatedFields.originalPrice - numValue) / updatedFields.originalPrice) * 100).toFixed(2);
                }
                break;

            case 'originalPrice':
                updatedFields.originalPrice = numValue;
                //Only calculate discountPercent, DO NOT calculate price
                if (updatedFields.price > 0 && numValue > 0) {
                    updatedFields.discountPercent = (((numValue - updatedFields.price) / numValue) * 100).toFixed(2);
                }
                break;

            case 'discountPercent':
                updatedFields.discountPercent = numValue;
                //Only calculate originalPrice, DO NOT calculate price
                if (updatedFields.price > 0 && numValue >= 0) {
                    updatedFields.originalPrice = (updatedFields.price / (1 - numValue / 100)).toFixed(2);
                }
                break;

            default:
                break;
        }

        return updatedFields;
    };

    //Function to handle selling price changes
    const handlePriceChange = (e) => {
        const value = e.target.value;
        const updatedFields = calculatePricing('price', value, formFields);
        setformFields(updatedFields);
    };

    //Function to handle original price changes
    const handleOriginalPriceChange = (e) => {
        const value = e.target.value;
        const updatedFields = calculatePricing('originalPrice', value, formFields);
        setformFields(updatedFields);
    };

    //Function to handle discount percentage changes
    const handleDiscountPercentChange = (e) => {
        const value = e.target.value;
        const updatedFields = calculatePricing('discountPercent', value, formFields);
        setformFields(updatedFields);
    };

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
                        message: "Please select an image with a correct format (jpeg, png, gif, jpg, webp)"
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
        //Send new data
        formdata.append('originalPrice', formFields.originalPrice || formFields.price);
        formdata.append('discountPercent', formFields.discountPercent || 0);
        //Backward compatible with old API
        formdata.append('oldPrice', formFields.originalPrice || formFields.price);
        formdata.append('discount', formFields.discountPercent || 0);
        formdata.append('countInStock', formFields.countInStock);
        formdata.append('catName', formFields.catName);
        formdata.append('subCatId', formFields.subCatId);
        formdata.append('category', formFields.category);
        formdata.append('subCat', formFields.subCat);
        formdata.append('rating', formFields.rating);
        formdata.append('isFeatured', formFields.isFeatured);
        formdata.append('productSize', formFields.productSize);
        formdata.append('productColor', formFields.productColor);
        formdata.append('productWeight', formFields.productWeight);
        formdata.append('productClassify', JSON.stringify(formFields.productClassify));

        formFields.images = appendedArray;

        // -------------- if ermpty
        if (formFields.name === "") {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter a product name"
            });
            setLoading(false);
            return false;
        }

        if (formFields.description === "") {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter a product description"
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

        if (!formFields.price || formFields.price <= 0) {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter a valid selling price (greater than 0)"
            });
            setLoading(false);
            return false;
        }

        //Validation for originalPrice - only check if there is a value
        if (formFields.originalPrice && formFields.originalPrice < formFields.price) {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Original price must be greater than or equal to the current selling price"
            });
            setLoading(false);
            return false;
        }

        // Validation cho discountPercent
        if (formFields.discountPercent && (formFields.discountPercent < 0 || formFields.discountPercent > 100)) {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Discount percentage must be from 0 to 100"
            });
            setLoading(false);
            return false;
        }

        if (formFields.countInStock === null || formFields.countInStock <= 0 || !/^\d+(\.\d+)?$/.test(formFields.countInStock)) {
            context.setAlterBox({
                open: true,
                error: true,
                message: "Please enter the product quantity"
            });
            setLoading(false);
            return false;
        }

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
                    <h5 className="mb-0">Add product</h5>
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
                            label="Add product"
                        />
                    </Breadcrumbs>
                </div>

                <form className="form" onSubmit={addProduct}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card shadow border-0 p-4 mt-0">
                                <h5 className="mb-4">Basic information</h5>

                                <div className="form-group">
                                    <h6>Product name</h6>
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
                                        <div className="">
 <div className="">
 <h6>Subcategory</h6>
 <Select
 Value={subCategoryValue}
 OnChange={handleChangeSubCategory}
 DisplayEmpty
 InputProps={{ '': '' }}
 ClassName=""
 >
 <MenuItem value="">
 <em value={null}> -- Select subcategory --</em>
 </MenuItem>

 {
 Context.subCatData.subCategoryList.length!== 0 &&
 Context.subCatData.subCategoryList.map((subCat, index) => {
 Return (
 <MenuItem className=""
 Value={subCat.id} key={index}>{subCat.subCat}
 </MenuItem>
 )
 })
 }
 </Select>
 </div>
 </div>Sub-category</h6>
                                            <Select
                                                value={subCategoryValue}
                                                onChange={handleChangeSubCategory}
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                className="w-100"
                                            >
                                                <MenuItem value="">
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
                                    </div> */}
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Current selling price (VND)<span className="text-primary">*</span></h6>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formFields.price || ''}
                                                onChange={handlePriceChange}
                                                placeholder="Enter official selling price"
                                                min="0"
                                                step="1000"
                                                className="form-control"
                                                style={{ borderColor: '#007bff', borderWidth: '2px' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="col">``
                                        <div className="form-group">
                                            <h6>Original price (VND)</h6>
                                            <input
                                                type="number"
                                                name="originalPrice"
                                                value={formFields.originalPrice || ''}
                                                onChange={handleOriginalPriceChange}
                                                placeholder="Calculate automatically or enter manually"
                                                min="0"
                                                step="1000"
                                                className="form-control"
                                                style={{ backgroundColor: '#f8fff8' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Discount (%)</h6>
                                            <input
                                                type="number"
                                                name="discountPercent"
                                                value={formFields.discountPercent || ''}
                                                onChange={handleDiscountPercentChange}
                                                placeholder="Calculate automatically or enter manually"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                className="form-control"
                                                style={{ backgroundColor: '#f8fff8' }}
                                            />
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
                          Display size list                       <div className="col">
                                        <div className="form-group">
                                            <h6>Brand</h6>
                                            <input type="text"
                                                name="brand" value={formFields.brand || "InkMe3D"} onChange={inputChange} />
                                        </div>
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Size</h6>
                                            <div className="d-flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newSizeInput}
                                                    onChange={(e) => setNewSizeInput(e.target.value)}
                                                    onKeyPress={handleSizeKeyPress}
                                                    placeholder="Enter size (e.g., S, M, L, XL)"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addProductSize}
                                                    variant="outlined"
                                                    size="small"
                                                    style={{ minWidth: '120px' }}
                                                >
                                                    + Thêm size
                                                </Button>
                                            </div>{/* Display size list */}<div className="d-flex flex-wrap gap-2">
                                                {productSize.map((size, index) => (
                                                    <div key={index} className="badge bg-primary d-flex align-items-center gap-1" style={{ fontSize: '12px', padding: '5px 8px' }}>
                                                        {size}
     Display color list                       <span
                                                            className="cursor-pointer text-white"
                                                            onClick={() => removeProductSize(index)}
                                                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                        >
                                                            ×
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Color</h6>
                                            <div className="d-flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newColorInput}
                                                    onChange={(e) => setNewColorInput(e.target.value)}
                                                    onKeyPress={handleColorKeyPress}
                                                    placeholder="Enter color (e.g., Red, Blue, Yellow)"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addProductColor}
                                                    variant="outlined"
                                                    size="small"
                                                    style={{ minWidth: '120px' }}
                                                >
                                                    + Thêm màu
                                                </Button>
                                            </div>{/* Display color list */}<div className="d-flex flex-wrap gap-2">
                                                {productColor.map((color, index) => (
                                                    <div key={index} className="badge bg-success d-flex align-items-center gap-1" style={{ fontSize: '12px', padding: '5px 8px' }}>
                                                        {color}
                                                        <span
                                                            className="cursor-pointer text-white"
                                                            onClick={() => removeProductColor(index)}
                                                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                        >
                                                            ×
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Weight (g)</h6>
                                            <input type="text"
                                                name="productWeight" value={formFields.productWeight} onChange={inputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <h6>Rating</h6>
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

                                {/* Product Classify Section */}
                                <div className="form-group">
                                    <h6>Product category</h6>
                                    <div className="mb-3">
                                        <Button type="button" onClick={addProductClassify} variant="outlined" size="small">
                                            + Thêm phân loại
                                        </Button>
                                    </div>
                                    {productClassify.map((classify, index) => (
                                        <div key={index} className="border p-3 mb-3 rounded">
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Category name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={classify.name}
                                                            onChange={(e) => updateProductClassify(index, 'name', e.target.value)}
                                                            placeholder="VD: Áo thun nam size M"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Quantity</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={classify.quantity}
                                                            onChange={(e) => updateProductClassify(index, 'quantity', parseInt(e.target.value) || 0)}
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Giá</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={classify.price}
                                                            onChange={(e) => updateProductClassify(index, 'price', parseInt(e.target.value) || 0)}
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Image URL</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={classify.image}
                                                            onChange={(e) => updateProductClassify(index, 'image', e.target.value)}
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-2 d-flex align-items-end">
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeProductClassify(index)}
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        className="mb-3"
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div >

                        <div className="col-md-12">
                            <div className="card shadow border p-4 mt-0">
                                <div className="imageUploadSec">
                                    <h5 className="mb-4">Add product photo</h5>
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
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                        <div className="uploadBox">
                                            {
                                                uploading === true ?
                                                    <div className="progressBar text-center d-flex align-items-center justify-content-center flex-column">
                                                        <CircularProgress color='inherit'
                                                            className='loader ml-2' />
                                                        <p>Uploading...</p>

                                                    </div>
                                                    :
                                                    <>
                                                        <input type="file" multiple name="images"
                                                            onChange={(e) => onChangeFile(e, `/api/products/upload`)} />
                                                        <div className="info">
                                                            <FaRegImages />
                                                            <h5>Add photo</h5>
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

                    </div>

                </form >

            </div >
        </>
    )
}

// export default ProductUpload;
export { ProductUpload as InkMeProductUpload };
