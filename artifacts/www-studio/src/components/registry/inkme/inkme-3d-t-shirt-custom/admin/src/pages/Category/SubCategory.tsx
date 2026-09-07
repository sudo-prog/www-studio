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

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

export const data = [
  ["Year", "Sales", "Expenses", "Profit"],
  ["2014", 1000, 400, 200],
  ["2015", 1170, 460, 250],
  ["2016", 660, 1120, 300],
  ["2017", 1030, 540, 350],
];

export const options = {
  'backgroundColor': 'transparent',
  'chartArea': { width: '100%', height: '100%' },
};

const SubCategory = () => {

  const [subCatData, setSubCatData] = useState([]);
  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(20);
    fetchDataFromApi('/api/subCat').then((res) => {
      setSubCatData(res);
      context.setProgress(100);
    })

  }, []);

  const deleteCategory = (id) => {
    deleteData(`/api/subCat/${id}`).then(res => {
      fetchDataFromApi('/api/subCat').then((res) => {
        setSubCatData(res);
      })
    })
  }

  const handleChange = (event, value) => {
    context.setProgress(40);
    fetchDataFromApi(`/api/subCat?page=${value}`).then((res) => {
      setSubCatData(res);
      context.setProgress(100);
    })
  };

  return (
    <>
      <div className="right-content w-100">

        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className='mb-0 d-flex align-items-center'>Subcategory list</h5>

          <div className="ml-auto d-flex align-items-center">

            <Breadcrumbs aria-label='breadcrumb' className='ml-auto breadcrumbs_' >
              <StyledBreadcrumb
                component="a"
                href='#'
                label="Classification"
                icon={<HomeIcon fontSize="small" />}
              />

              <StyledBreadcrumb
                label="Subcategory list"
                deleteIcon={<ExpandMoreIcon />}
              />
            </Breadcrumbs>

            <Link to="/subCategory/add">
              <Button className='btn-blue ml-3 pl-3 pr-3'>Add Subcategory</Button>
            </Link>

          </div>
        </div>

        <div className='card shadow border-0 p-3'>

          <div className='table-responsive mt-3'>
            <table className='table table-bordered table-striped v-align'>
              <thead className='thead-dark'>
                <tr>
                  <th>#ID</th>
                  <th style={{ width: '300px' }}>Category image</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {
                  subCatData?.subCategoryList?.length !== 0 && subCatData?.subCategoryList?.map((item, index) => {
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
                              <div className="img">
                                <img className='w-100'
                                  src={item?.category?.images[0]}
                                  alt="" />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{item?.category?.name}</td>
                        <td>{item?.subCat}</td>
                        <td>
                          <div className='actions d-flex align-items-center justify-content-center'>
                            <Link to="/product/details">
                              <Button className='secondary' color='secondary'><FaEye /></Button>
                            </Link>

                            <Link to={`/subCategory/edit/${item.id}`}>
                              <Button className='success' color='success'>
                                <FaPencilAlt />
                              </Button>
                            </Link>

                            <Button className='error' color='error' onClick={() => deleteCategory(item.id)}>
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

            {
              subCatData?.totalPages > 1 &&
              <div className="d-flex tableFooter">
                <Pagination className='pagination'
                  count={subCatData?.totalPages}
                  onChange={handleChange}
                  color='primary'
                  showFirstButton showLastButton
                />
              </div>
            }

          </div>

        </div>

      </div>
    </>
  )
}

// export default SubCategory;
export { SubCategory as InkMeSubCategory };
