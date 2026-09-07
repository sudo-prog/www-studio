import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import * as React from 'react'; // originally: import { createContext, useEffect, useState, useRef } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ProductUpload from './pages/Products/addProduct';
import EditProduct from './pages/Products/editProduct';
import CategoryAdd from './pages/Category/addCategory';
import SubCategory from './pages/Category/subCategoryList';
import SubCatAdd from './pages/Category/addSubCat';
import SubCatEdit from './pages/Category/editSubCat';
import CategoryEdit from './pages/Category/editCategory';
import Category from './pages/Category/categoryList';
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert';
import LoadingBar from 'react-top-loading-bar';
import { fetchDataFromApi } from './utils/api';
import AddProductRams from './pages/Products/addProductRams';
import AddProductSize from './pages/Products/addProductSize';
import Orders from './pages/Orders';
import HomeBanner from './pages/HomeBanner';
import AddHomeBanner from './pages/HomeBanner/addHomeBanner';


const MyContext = createContext();



function App() {

  const [isToggleSidebar, setIsToggleSidebar] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isHideSidebarAndHeader, setIsHideSidebarAndHeader] = useState(false);
  const [themeMode, setThemeMode] = useState(true);

  const [progress, setProgress] = useState(0);
  const [BASE_URL, setBASE_URL] = useState('https://fullstack-ecommerce-server-bhst.onrender.com/');

  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);

  const [alterBox, setAlterBox] = useState({
    message: '',
    error: false,
    open: false
  });

  const [user, setUser] = useState({
    name: '',
    email: '',
    userId: ''
  });

  useEffect(() => {

    // const themeMode = localStorage.getItem('themeMode');

    if (themeMode === true) {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('themeMode', 'light');
    } else {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      localStorage.setItem('themeMode', 'dark');
    }

  }, [themeMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token !== null && token !== "" && token !== undefined) {
      setIsLogin(true);

      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            userId: parsedUser.id || parsedUser.userId || '',
            isAdmin: parsedUser.isAdmin || false
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser({
          name: '',
          email: '',
          userId: '',
          isAdmin: false
        });
      }

    } else {
      setIsLogin(false);
    }
  }, [isLogin]);

  useEffect(() => {
    setProgress(20);
    fetchCategory();
    fetchSubCategory();
  }, []);

  const fetchCategory = () => {
    fetchDataFromApi('/api/category').then((res) => {
      setCatData(res);
      setProgress(100);
    })
  }

  const fetchSubCategory = () => {
    try {
      fetchDataFromApi('/api/subCat').then((res) => {
        setSubCatData(res);
        setProgress(100);
      })
    } catch (error) {
      console.log(error);
    }
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlterBox({
      open: false
    });
  };



  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    isLogin,
    setIsLogin,
    isHideSidebarAndHeader,
    setIsHideSidebarAndHeader,
    themeMode,
    setThemeMode,
    alterBox,
    setAlterBox,
    progress,
    setProgress,
    BASE_URL,
    setBASE_URL,
    catData,
    setCatData,
    subCatData,
    setSubCatData,
    fetchCategory,
    fetchSubCategory,
    user,
    setUser
  }

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>

        <LoadingBar
          color='#f11946'
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
          className='topLoadingBar'
        />

        <Snackbar open={alterBox.open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity={alterBox.error === false ? 'success' : 'error'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {alterBox.message}
          </Alert>
        </Snackbar>

        {
          isHideSidebarAndHeader !== true &&
          <Header />
        }
        <div className='main d-flex'>

          {
            isHideSidebarAndHeader !== true &&
            <div className={`sidebarWrapper ${isToggleSidebar === true ? 'toggle' : ''}`}>
              <Sidebar />
            </div>
          }

          <div className={`content ${isHideSidebarAndHeader === true && 'full'} 
          ${isToggleSidebar === true ? 'toggle' : ''}`}>
            <Routes>
              <Route path="/" exact={true} element={<Dashboard />} />
              <Route path="/dashboard" exact={true} element={<Dashboard />} />
              <Route path="/login" exact={true} element={<Login />} />
              <Route path="/signup" exact={true} element={<Signup />} />
              <Route path='/products' exact={true} element={<Products />} />
              <Route path='/product/details/:id' exact={true} element={<ProductDetails />} />
              <Route path='/product/upload' exact={true} element={<ProductUpload />} />
              <Route path='/product/edit/:id' exact={true} element={<EditProduct />} />
              <Route path='/category' exact={true} element={<Category />} />
              <Route path='/category/add' exact={true} element={<CategoryAdd />} />
              <Route path='/category/edit/:id' exact={true} element={<CategoryEdit />} />
              <Route path='/subCategory/' exact={true} element={<SubCategory />} />
              <Route path='/subCategory/add' exact={true} element={<SubCatAdd />} />\
              <Route path='/subCategory/edit/:id' exact={true} element={<SubCatEdit />} />
              <Route path='/productRams/add' exact={true} element={<AddProductRams />} />
              <Route path='/productSize/add' exact={true} element={<AddProductSize />} />
              <Route path='/orders' exact={true} element={<Orders />} />
              <Route path='/homeBanner' exact={true} element={<HomeBanner />} />
              <Route path='/homeBanner/add' exact={true} element={<AddHomeBanner />} />
            </Routes>
          </div>
        </div>
      </MyContext.Provider >
    </BrowserRouter>

  );
}

// export default App;
export { MyContext };
export { App as InkMeApp };
