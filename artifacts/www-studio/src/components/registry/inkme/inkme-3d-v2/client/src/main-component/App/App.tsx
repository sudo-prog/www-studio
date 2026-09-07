import * as React from 'react';
import AllRoute from "../router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MyContext, MyProvider } from "../../context/MyContext";
import { Alert, Snackbar } from "@mui/material";

// import CustomCursor from '../../components/CustomCursor/CustomCursor';

const AppContent = () => {
  const { alterBox, handleClose } = useContext(MyContext);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
          console.log('🔒 Token expired, clearing...');
          localStorage.clear();
          alert('Your session has expired. Please log in again.');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Invalid token, clearing...');
        localStorage.clear();
        window.location.href = '/login';
      }
    };

    checkTokenExpiry();
  }, []);

  return (
    <div className="App" id="scrool">
      <AllRoute />

      {/* Snackbar + Alert */}
      <Snackbar
        open={alterBox.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={alterBox.error ? "error" : "success"} // true -> error
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alterBox.message}
        </Alert>
      </Snackbar>
      {/* <CustomCursor/> */}
      <ToastContainer />
    </div>
  );
};

const App = () => {
  return (
    <MyProvider>
      <AppContent />
    </MyProvider>
  );
};

// export default App;
export { App as InkMeApp };
