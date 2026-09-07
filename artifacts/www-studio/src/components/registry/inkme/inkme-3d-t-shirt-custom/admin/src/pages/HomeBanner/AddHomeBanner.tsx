import * as React from 'react';
import { Breadcrumbs, Chip, emphasize, styled } from "@mui/material"
import HomeIcon from "@mui/icons-material/Home";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import { deleteData, fetchDataFromApi, editData, deleteImages, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaRegImages } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";

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

const AddHomeBanner = () => {

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState([]);

    const context = useContext(MyContext);

    const [formFields, setFormFields] = useState({
        images: []
    });

    const formdata = new FormData();

    const history = useNavigate();

    const changeInput = (e) => {
        setFormFields(() => (
            {
                ...formFields,
                [e.target.name]: e.target.value
            }
        ))
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

    const removeImg = async (index, imgUrl) => {
        const imgIndex = preview.indexOf(imgUrl);

        deleteImages(`/api/homeBanner/deleteImage?img=${imgUrl}`).then((res) => {
            context.setAlterBox({
                open: true,
                error: false,
                message: "Delete image"
            })
        })

        if (imgIndex > -1) {
            preview.splice(index, 1);
        }
       
    }

    const addHomeBanner = (e) => {
        e.preventDefault();

        const appendedArray = [...preview, ...uniqueArray];

        img_arr = [];

        formdata.append('images', appendedArray);

        formFields.images = appendedArray;

        if (preview.length !== 0) {
            setLoading(true);

            postData(`/api/homeBanner/create`, formFields).then((res) => {
                setLoading(false);
                context.fetchCategory();
                context.fetchSubCategory();

                deleteData('/api/imageUpload/deleteAllImages');

                history('/homeBanner');
            });
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
                    <h5 className="mb-0">Add Banner image</h5>
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Banner"
                            component="a"
                            href="#"
                        />
                        <StyledBreadcrumb
                            label="Thêm Banner"
                        />
                    </Breadcrumbs>
                </div>

                <form className="form" onSubmit={addHomeBanner} >
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card shadow p-4 mt-0">

                                <div className="imageUploadSec">
                                    <h5 className="mb-4">Add Banner image</h5>
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
                                                            onChange={(e) => onChangeFile(e, `/api/homeBanner/upload`)} />
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

                                <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                                    <FaCloudUploadAlt /> &nbsp;
                                    {loading === true ? <CircularProgress color='inherit'
                                        className='loader ml-2' /> : 'Thêm Banner'}
                                </Button>
                            </div>
                        </div>
                    </div>

                </form >

            </div >
        </>
    )
}

// export default AddHomeBanner;
export { AddHomeBanner as InkMeAddHomeBanner };
