import * as React from 'react';
import { Breadcrumbs, Chip, emphasize, styled } from "@mui/material"
import HomeIcon from "@mui/icons-material/Home";
import Slider from "react-slick";
import { MdBrandingWatermark } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import UserAvatarImgComponent from "../../components/UserAvatarImg";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FaReply } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { fetchDataFromApi, postData } from "../../utils/api";

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

const ProductDetails = () => {

    const productSliderBig = React.useRef();
    const productSliderSml = React.useRef();

    var ProductSliderOptions = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false
    };

    var ProductSliderSmlOptions = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false
    };

    const goToSlide = (index) => {
        productSliderBig.current.slickGoTo(index);
        productSliderSml.current.slickGoTo(index);
    }

    const [productData, setProductData] = useState([]);
    const [reviewData, setReviewData] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);

        fetchDataFromApi(`/api/products/${id}`).then((res) => {
            setProductData(res);
        })

        fetchDataFromApi(`/api/productReviews?productId=${id}`).then((res) => {
            setReviewData(res);
        })

    }, [id])

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4">
                    <h5 className="mb-0">Product information</h5>
                    <Breadcrumbs aria-label="breadcrumb" className="ms-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Management"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Product"
                            component="a"
                            href="#"
                        />
                        <StyledBreadcrumb
                            label="Product information"
                        />
                    </Breadcrumbs>
                </div>

                <div className="card productDetailsSection">
                    <div className="row">
                        <div className="col-md-5">
                            <div className="sliderWrapper pt-3 pb-3 ps-4 pe-4">
                                <h6 className="mb-3">Product image</h6>
                                <Slider {...ProductSliderOptions} ref={productSliderBig}
                                    className="sliderBig mb-2">
                                    {
                                        productData?.images?.map((item, index) => {
                                            return (
                                                <div className="item" key={index}>
                                                    <img src={item} alt=""
                                                        className="w-100" />
                                                </div>
                                            )
                                        })
                                    }
                                </Slider>
                                <Slider {...ProductSliderSmlOptions} ref={productSliderSml}
                                    className="sliderSml">
                                    {
                                        productData?.images?.map((item, index) => {
                                            return (
                                                <div className="item" key={index} onClick={() => goToSlide(index)}>
                                                    <img src={item} alt=""
                                                        className="w-100" />
                                                </div>
                                            )
                                        })
                                    }
                                </Slider>
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="pt-3 pb-3 ps-4 pe-4">
                                <h6 className="mb-3">Detailed information</h6>
                                <h4>{productData?.name}</h4>

                                <div className="productInfo mt-3">
                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><MdBrandingWatermark /></span>
                                            <span className="name">Brand</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>{productData?.brand}</span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><BiSolidCategoryAlt /></span>
                                            <span className="name">Classification</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>{productData?.catName}</span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><BiSolidCategoryAlt /></span>
                                            <span className="name">Tags</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>
                                                <ul className="list list-inline tags sml">
                                                    {
                                                        productData?.productRams?.map((item, index) => {
                                                            return (
                                                                <li className="list-inline-item">
                                                                    <span>{item}</span>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><BiSolidCategoryAlt /></span>
                                            <span className="name">Color</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>
                                                <ul className="list list-inline tags sml">
                                                    <li className="list-inline-item">
                                                        <span>Red</span>
                                                    </li>
                                                    <li className="list-inline-item">
                                                        <span>White</span>
                                                    </li>
                                                    <li className="list-inline-item">
                                                        <span>Xanh</span>
                                                    </li>
                                                    <li className="list-inline-item">
                                                        <span>Black</span>
                                                    </li>
                                                    <li className="list-inline-item">
                                                        <span>Vàng</span>
                                                    </li>
                                                </ul>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><BiSolidCategoryAlt /></span>
                                            <span className="name">Size</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>
                                                <ul className="list list-inline tags sml">
                                                    {
                                                        productData?.productSize?.map((item, index) => {
                                                            return (
                                                                <li className="list-inline-item">
                                                                    <span>{item}</span>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><BiSolidCategoryAlt /></span>
                                            <span className="name">Giá bán</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>{productData?.price?.toLocaleString('vi-VN')} </span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><BiSolidCategoryAlt /></span>
                                            <span className="name">Quantity</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>({productData?.countInStock})</span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><BiSolidCategoryAlt /></span>
                                            <span className="name">Review</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>({reviewData.length}) Reviews</span>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-3 d-flex align-items-center">
                                            <span className="icon"><BiSolidCategoryAlt /></span>
                                            <span className="name">Date posted</span>
                                        </div>

                                        <div className="col-md-9 ">
                                            :<span>{productData?.dateCreated}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <h5 className="mt-4 mb-3">Product description</h5>
                        <p>
                            {productData?.description}
                        </p>

                        <h5 className="mt-4 mb-3">Product review</h5>

                        <div className="ratingSection">
                            <div className="ratingrow d-flex align-items-center">
                                <span className="col1">
                                    5 Star
                                </span>
                                <span className="col2">
                                    <div className="progress">
                                        <div className="progress-bar" style={{ width: "70%" }}>

                                        </div>
                                    </div>
                                </span>
                                <span className="col3">
                                    (22)
                                </span>
                            </div>

                            <div className="ratingrow d-flex align-items-center">
                                <span className="col1">
                                    4 Star
                                </span>
                                <span className="col2">
                                    <div className="progress">
                                        <div className="progress-bar" style={{ width: "50%" }}>

                                        </div>
                                    </div>
                                </span>
                                <span className="col3">
                                    (22)
                                </span>
                            </div>

                            <div className="ratingrow d-flex align-items-center">
                                <span className="col1">
                                    3 Star
                                </span>
                                <span className="col2">
                                    <div className="progress">
                                        <div className="progress-bar" style={{ width: "70%" }}>

                                        </div>
                                    </div>
                                </span>
                                <span className="col3">
                                    (22)
                                </span>
                            </div>

                            <div className="ratingrow d-flex align-items-center">
                                <span className="col1">
                                    2 Star
                                </span>
                                <span className="col2">
                                    <div className="progress">
                                        <div className="progress-bar" style={{ width: "70%" }}>

                                        </div>
                                    </div>
                                </span>
                                <span className="col3">
                                    (22)
                                </span>
                            </div>

                            <div className="ratingrow d-flex align-items-center">
                                <span className="col1">
                                    1 Star
                                </span>
                                <span className="col2">
                                    <div className="progress">
                                        <div className="progress-bar" style={{ width: "70%" }}>

                                        </div>
                                    </div>
                                </span>
                                <span className="col3">
                                    (22)
                                </span>
                            </div>
                        </div>

                        <br />

                        {
                            reviewData?.length > 0 &&
                            <>
                                <h5 className="mt-4 mb-3">Customer feedback</h5>

                                <div className="reviewsSection">

                                    {
                                        reviewData?.map((item, index) => {
                                            return (
                                                <div className="reviewsRow">
                                                    <div className="row">
                                                        <div className="col-sm-7 d-flex">
                                                            <div className="d-flex flex-column">
                                                                <div className="userInfo d-flex align-items-center">
                                                                    <UserAvatar<div className="">
 <div className="">
 <div className="">
 <div className="">
 <div className="">
 <UserAvatarImgComponent
 Img='' lg={true}
 />

 <div className="">
 <h6>Nguyen Van A</h6>
 <span>25 minutes ago</span>
 </div>
 </div>
 <Rating name="" value={4.5} precision={0.5} readOnly />
 </div>
 </div>

 <div className="">
 <div className="">
 <Button className=""><FaReply /> &nbsp; Reply</Button>
 </div>
 </div>

 <p className="">Lorem Ipsum is dummy text of printing and typesetting industry.
 Lorem Ipsum has been industry's standard dummy text ever since the 1500s,
 When unknown printer took galley of type and scrambled it to make type specimen book.
 </p>
 </div>
 </div>

 <div className="">
 <div className="">
 <div className="">
 <div className="">
 <div className="">
 <UserAvatarImgComponent
 Img='' lg={true}
 />

 <div className="">
 <h6>Nguyen Van A</h6>
 <span>25 minutes ago</span>
 </div>
 </div>
 <Rating name="" value={4.5} precision={0.5} readOnly />
 </div>
 </div>

 <div className="">
 <div className="">
 <Button className=""><FaReply /> &nbsp; Reply</Button>
 </div>
 </div>

 <p className="">Lorem Ipsum is dummy text of printing and typesetting industry.
 Lorem Ipsum has been industry's standard dummy text ever since the 1500s,
 When unknown printer took galley of type and scrambled it to make type specimen book.
 </p>
 </div>
 </div>

 <div className="">
 <div className="">
 <div className="">
 <div className="">
 <div className="">
 <UserAvatarImgComponent
 Img='' lg={true}
 />

 <div className="">
 <h6>Nguyen Van A</h6>
 <span>25 minutes ago</span>
 </div>
 </div>
 <Rating name="" value={4.5} precision={0.5} readOnly />
 </div>
 </div>

 <div className="">
 <div className="">
 <Button className=""><FaReply /> &nbsp; Reply</Button>
 </div>
 </div>

 <p className="">Lorem Ipsum is dummy text of printing and typesetting industry.
 Lorem Ipsum has been industry's standard dummy text ever since the 1500s,
 When unknown printer took galley of type and scrambled it to make type specimen book.
 </p>
 </div>
 </div>                                </div>
                                    </div>

                                    <p className="mt-3">Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                                        when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                                    </p>
                                </div>
                            </div>

                            <div className="reviewsRow">
                                <div className="row">
                                    <div className="col-sm-7 d-flex">
                                        <div className="d-flex flex-column">
                                            <div className="userInfo d-flex align-items-center">
                                                <UserAvatarImgComponent
                                                    img='https://mironcoder-hotash.netlify.app/images/avatar/01.webp' lg={true}
                                                />

                                                <div className="info ps-3">
                                                    <h6>Nguyen Van A</h6>
                                                    <span>25 minutes ago</span>
                                                </div>
                                            </div>
                                            <Rating name="read-only" value={4.5} precision={0.5} readOnly />
                                        </div>
                                    </div>

                                    <div className="col-sm-5 d-flex align-items-center">
                                        <div className="ms-auto">
                                            <Button className="btn-blue btn-big btn-lg ms-auto"><FaReply />&nbsp; Reply</Button>
                                        </div>
                                    </div>

                                    <p className="mt-3">Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                                        when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                                    </p>
                                </div>
                            </div> */}


                    </div>
                </div>

            </div>
        </>
    )
}

// export default ProductDetails
export { StyledBreadcrumb as InkMeStyledBreadcrumb };
