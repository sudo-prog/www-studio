import * as React from 'react';
import { Breadcrumbs, Chip, emphasize, styled } from "@mui/material"
import HomeIcon from "@mui/icons-material/Home";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import { editData, fetchDataFromApi, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaRegImages } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";

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

const EditCategory = () => {

    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [imgFiles, setImgFiles] = useState();

    const [preview, setPreview] = useState();
    const [isSelectedFiles, setIsSelectedFiles] = useState(false);
    const [category, setcategory] = useState([]);

    let { id } = useParams();

    const context = useContext(MyContext);

    const [formFields, setFormFields] = useState({
        name: "",
        subCat: "",
        images: [],
        color: ""
    });

    const formdata = new FormData();

    const history = useNavigate();

    useEffect(() => {
        if (!imgFiles) return;

        let tmp = [];
        for (let i = 0; i < imgFiles.length; i++) {
            tmp.push(URL.createObjectURL(imgFiles[i]));
        }
        const objectUrls = tmp;
        setPreview(objectUrls);

        // free memory
        for (let i = 0; i < objectUrls.length; i++) {
            return () => {
                URL.revokeObjectURL(objectUrls[i]);
            }
        }
    }, [imgFiles])

    useEffect(() => {
        context.setProgress(20);
        fetchDataFromApi(`/api/category/${id}`).then((res) => {
            setcategory(res);
            setFormFields({
                name: res.name,
                subCat: res.subCat,
                color: res.color
            });
            setPreview(res.images);
            context.setProgress(100);
        })
    }, [])

    const changeInput = (e) => {
        setFormFields(() => (
            {
                ...formFields,
                [e.target.name]: e.target.value
            }
        ))
    }

    const onChangeFile = async (e, apiEndPoint) => {
        try {
            const imgArray = [];
            const files = e.target.files;

            for (var i = 0; i < files.length; i++) {

                // validate file type
                if (files[i] && (files[i].type === 'image/jpeg' ||
                    files[i].type === 'image/png' ||
                    files[i].type === 'image/gif' ||
                    files[i].type === 'image/jpg' ||
                    files[i].type === 'image/webp')) {
                    setImgFiles(e.target.files);

                    const file = files[i];
                    imgArray.push(file);
                    formdata.append(`images`, file);
                    setFiles(imgArray);
                } else {
                    context.setAlterBox({
                        open: true,
                        color: true,
                        message: "Please choose an image in the correct format (jpeg, png, gif, jpg, webp)"
                    })
                }
            }


            setIsSelectedFiles(true);

            console.log(imgArray);
            postData(apiEndPoint, formdata).then((res) => {
                console.log(res);
            });

        } catch (error) {
            console.log(error);
        }
    }

    const editCategory = (e) => {
        e.preventDefault();
        setLoading(true);

        formdata.append('name', formFields.name);
        formdata.append('subCat', formFields.subCat);
        formdata.append('color', formFields.color);

        if (formFields.name !== "" && formFields.subCat !== "" && formFields.color !== "") {
            setLoading(true);

            editData(`/api/category/${id}`, formFields).then((res) => {
                context.setAlterBox({
                    open: true,
                    error: false,
                    message: "Category edited successfully"
                });
                setLoading(false);
                context.fetchCategory();
                context.fetchSubCategory();
                history('/category');
            })

        } else {
            context.setAlterBox({
                open: true,
                color: true,
                message: "Vui lòng nhập đầy đủ thông tin"
            });
            return false;
        }

    }

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4">
                    <h5 className="mb-0">Edit category</h5>
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Category"
                            component="a"
                            href="#"
                        />
                        <StyledBreadcrumb
                            label="Edit category"
                        />
                    </Breadcrumbs>
                </div>

                <form className="form" onSubmit={editCategory} >
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card shadow p-4 mt-0">
                                <div className="form-group">
                                    <h6>Category name</h6>
                                    <input type="text" name="name" value={formFields.name}
                                        onChange={changeInput} />
                                </div>

                                <div className="form-group">
                                    <h6>Subcategory</h6>
                                    <input type="text" name="subCat" value={formFields.subCat}
                                        onChange={changeInput} />
                                </div>

                                <div className="form-group">
                                    <h6>Color</h6>
                                    <input type="text" name="color" value={formFields.color}
                                        onChange={changeInput} />
                                </div>

                                <div className="imageUploadSec">
                                    <h5 className="mb-4">Add category image</h5>
                                    <div className="imgUploadBox d-flex align-items-center">
                                        {
                                            preview?.length !== 0 && preview?.map((img, index) => {
                                                return (
                                                    <div className="uploadBox" key={index}>
                                                        {/* <span className="remove"><IoCloseSharp /></span> */}
                                                        <div className="box">
                                                            {
                                                                isSelectedFiles === true ?
                                                                    <LazyLoadImage
                                                                        alt="image"
                                                                        effect="blur"
                                                                        className="w-100"
                                                                        src={`${img}`}
                                                                    />
                                                                    :
                                                                    <LazyLoadImage
                                                                        alt="image"
                                                                        effect="blur"
                                                                        className="w-100"
                                                                        src={`${img}`}
                                                                    />
                                                            }
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                        <div className="uploadBox">
                                            <input type="file" multiple name="images"
                                                onChange={(e) => onChangeFile(e, '/api/category/upload')} />
                                            <div className="info">
                                                <FaRegImages />
                                                <h5>Thêm ảnh</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <br />

                                <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                                    <FaCloudUploadAlt /> &nbsp;
                                    {loading === true ? <CircularProgress color='inherit'
                                        className='loader ml-2' /> : 'Edit category'}
                                </Button>
                            </div>
                        </div>
                    </div>

                </form >

            </div >
        </>
    )
}

// export default EditCategory;
export { EditCategory as InkMeEditCategory };
