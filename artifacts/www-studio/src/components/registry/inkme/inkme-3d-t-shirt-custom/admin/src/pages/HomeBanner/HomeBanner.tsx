import * as React from 'react';
import * as React from 'react'; // originally: import { useState } from 'react';
import { MdDelete } from "react-icons/md";
import { FaPencilAlt } from "react-icons/fa";
import Button from '@mui/material/Button';

import { FaEye } from 'react-icons/fa6';
import Pagination from '@mui/material/Pagination';
import { MyContext } from '../../App';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import HomeIcon from '@mui/icons-material/Home';
import Chip from '@mui/material/Chip';
import { emphasize } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { deleteData, fetchDataFromApi } from '../../utils/api';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";




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


export const options = {
    'backgroundColor': 'transparent',
    'chartArea': { width: '100%', height: '100%' },
};

const HomeBanner = () => {

    const [homeBannerData, setHomeBannerData] = useState([]);
    const context = useContext(MyContext);
    const [open, setOpen] = React.useState(false);

    const [lightboxIndex, setLightboxIndex] = useState(0);

    //Create photo list for Lightbox
    const slides = homeBannerData?.HomeBannerList?.map(item => ({
        src: item.images[0],
    })) || [];

    useEffect(() => {

        window.scrollTo(0, 0);
        context.setProgress(20);
        fetchDataFromApi('/api/homeBanner').then((res) => {
            setHomeBannerData(res);
            context.setProgress(100);
        })

    }, []);

    const deleteHomeBanner = (id) => {
        deleteData(`/api/homeBanner/${id}`).then((res) => {
            fetchDataFromApi('/api/homeBanner').then((res) => {
                setHomeBannerData(res);
            })
            context.setAlterBox({
                open: true,
                error: false,
                message: "Xóa Banner Thanh Cong"
            })
        })
    }

    const handleChange = (event, value) => {
        context.setProgress(40);
        fetchDataFromApi(`/api/hoemeBanner?page=${value}`).then((res) => {
            setHomeBannerData(res);
            context.setProgress(100);
        })
    };

    return (
        <>
            <div className="right-content w-100">

                <div className="card shadow border-0 w-100 flex-row p-4">
                    <h5 className='mb-0 d-flex align-items-center'>Danh sách Banner</h5>

                    <div className="ml-auto d-flex align-items-center">

                        <Breadcrumbs aria-label='breadcrumb' className='ml-auto breadcrumbs_' >
                            <StyledBreadcrumb
                                component="a"
                                href='#'
                                label="Danh sách Banner"
                                deleteIcon={<ExpandMoreIcon />}
                                icon={<HomeIcon fontSize="small" />}
                            />

                        </Breadcrumbs>

                        <Link to="/homeBanner/add">
                            <Button className='btn-blue ml-3 pl-3 pr-3'>Thêm Banner</Button>
                        </Link>

                    </div>
                </div>

                <div className='card shadow border-0 p-3'>

                    <div className='table-responsive mt-3'>
                        <table className='table table-bordered table-striped v-align'>
                            <thead className='thead-dark'>
                                <tr>
                                    <th style={{ width: '10%' }}>#ID</th>
                                    <th style={{ width: '60%' }}>Photo</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {
                                    homeBannerData?.HomeBannerList?.length !== 0 && homeBannerData?.HomeBannerList?.map((item, index) => {
                                        return (
                                            <tr>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <Checkbox /> <span>#{index + 1}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center productBox">
                                                        <div className="imgWrapper">
                                                            <div className="img" >
                                                                <img
                                                                    className=''
                                                                    src={item.images[0]}
                                                                    alt=""
                                                                    style={{ cursor: "pointer", width: "auto" }}
                                                                    onClick={() => {
                                                                        setLightboxIndex(index);
                                                                        setOpen(true);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className='actions d-flex align-items-center justify-content-center'>
                                                        <Link to="/product/details">
                                                            <Button className='secondary' color='secondary'><FaEye /></Button>
                                                        </Link>

                                                        <Button className='error' color='error' onClick={() => deleteHomeBanner(item.id)}>
                                                            <MdDelete />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })

                                }

                            </tbody>

                        </table>
                        {/* Lightbox */}
                        <Lightbox
                            open={open}
                            close={() => setOpen(false)}
                            slides={slides}
                            index={lightboxIndex}
                        />
                        
                        {
                            homeBannerData?.totalPages > 1 &&
                            <div className="d-flex tableFooter">
                                <Pagination className='pagination'
                                    count={homeBannerData?.totalPages}
                                    onChange={handleChange}
                                    color='primary'
                                    showFirstButton showLastButton
                                />
                            </div>
                        }

                    </div>

                </div>

            </div >
        </>
    )
}

// export default HomeBanner;
export { HomeBanner as InkMeHomeBanner };
