import * as React from 'react'; // originally: import { useContext, useState } from 'react';
import Logo from "../../img/logo/inkme-logo-gradient.png";
import * as React from 'react'; // originally: import { useEffect } from 'react';
import patern from "../../img/pattern.webp";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcons from "../../img/GoogleIcons.png";
import { baseUrl, postData } from "../../utils/api";
import { CircularProgress } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import { loginWithGoogle } from "../../services/UserServices";
import { MyContext } from "../../context/MyContext";
import { GoogleLogin } from "@react-oauth/google";
import { trackLogin } from "../../utils/analytics";

// Thêm CSS inline cho trang login
const loginStyles = `
  .loginSection {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
    min-height: 120vh;
    display: flex;
    align-items: center;
    padding: 2rem 0;
    overflow-x: hidden;
  }

  .loginSection::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.2) 0%, transparent 50%);
    z-index: 1;
  }

  .loginPattern {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
    z-index: 1;
  }

  .modern-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(30px);
    border-radius: 24px;
    padding: 3rem 2.5rem;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    z-index: 10;
    max-width: 100%;
    width: 100%;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(0);
    animation: slideInUp 0.6s ease-out;
  }

  .modern-card:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 35px 70px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .login-title {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .login-subtitle {
    color:rgb(255, 255, 255);
    font-size: 1rem;
    margin-bottom: 0;
    font-weight: 500;
  }

  .form-group {
    margin-bottom: 1.5rem;
    position: relative;
  }

  .form-control {
    border: 2px solid rgba(226, 232, 240, 0.6);
    border-radius: 16px;
    padding: 1rem 1.25rem 1rem 3.5rem;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    color: #2d3748;
    width: 100%;
  }

  .form-control::placeholder {
    color: #94a3b8;
    font-weight: 400;
    transition: all 0.3s ease;
  }

  .form-control:focus {
    border-color: #667eea;
    box-shadow: 
      0 0 0 4px rgba(102, 126, 234, 0.15),
      0 10px 20px rgba(102, 126, 234, 0.1);
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
    outline: none;
  }

  .form-control:focus::placeholder {
    color: #cbd5e1;
    transform: translateY(-2px);
  }

  .loginSection .icon {
    position: absolute;
    left: 1.25rem;
    top: 1rem;
    transform: translateY(0);
    color: #94a3b8;
    z-index: 2;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .form-group.focus .icon,
  .form-control:focus + .icon {
    color: #667eea;
    transform: translateY(0) scale(1.1);
  }

  .btn-blue {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 16px;
    padding: 1rem 2rem;
    font-weight: 700;
    text-transform: none;
    font-size: 1rem;
    letter-spacing: 0.02em;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: white;
    width: 100%;
    position: relative;
    overflow: hidden;
    box-shadow: 
      0 10px 20px rgba(102, 126, 234, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .btn-blue::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .btn-blue:hover::before {
    left: 100%;
  }

  .btn-blue:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 20px 40px rgba(102, 126, 234, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    color: white;
  }

  .btn-blue:active {
    transform: translateY(-1px);
  }

  .toggleShowPassword {
    position: absolute;
    right: 1.25rem;
    top: 1rem;
    transform: translateY(0);
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    padding: 0.25rem;
    border-radius: 8px;
  }

  .toggleShowPassword:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(0) scale(1.1);
  }

  /* Error states */
  .form-control.is-invalid {
    border-color: #dc3545 !important;
    box-shadow: 
      0 0 0 4px rgba(220, 53, 69, 0.15),
      0 10px 20px rgba(220, 53, 69, 0.1) !important;
    background: rgba(255, 255, 255, 0.95) !important;
  }

  .form-control.is-invalid:focus {
    border-color: #dc3545 !important;
    box-shadow: 
      0 0 0 4px rgba(220, 53, 69, 0.2),
      0 10px 20px rgba(220, 53, 69, 0.15) !important;
  }

  .form-group.focus .form-control.is-invalid {
    border-color: #dc3545 !important;
    box-shadow: 
      0 0 0 4px rgba(220, 53, 69, 0.2),
      0 10px 20px rgba(220, 53, 69, 0.15) !important;
  }

  .invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #dc3545;
    font-weight: 500;
    background: rgba(255, 255, 255);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border-left: 3px solid #dc3545;
  }

  .btn-blue:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .toggleShowPassword {
    position: absolute;
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    padding: 0.25rem;
    border-radius: 8px;
  }

  .toggleShowPassword:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-50%) scale(1.1);
  }

  .link {
    color:rgb(0, 196, 255);
    text-decoration: none;
    font-weight: 700;
    transition: all 0.3s ease;
    position: relative;
  }

  .link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }

  .link:hover::after {
    width: 100%;
  }

  .link:hover {
    color: #764ba2;
    text-decoration: none;
  }

  .signup-text {
    color:rgb(255, 255, 255);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .signup-link {
    color: rgb(0, 196, 255);
    text-decoration: none;
    font-weight: 700;
    transition: all 0.3s ease;
    position: relative;
  }

  .signup-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }

  .signup-link:hover::after {
    width: 100%;
  }

  .signup-link:hover {
    color: #764ba2;
    text-decoration: none;
  }

  .or {
    margin: 1.5rem 0;
  }

  .line {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.4), transparent);
    flex: 1;
  }

  .txt {
    padding: 0 1rem;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Google login button responsive */
  .loginSection [role="button"] {
    width: 100% !important;
    max-width: 100% !important;
  }

  .loginSection .google-login-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-left: 0 !important;
  }

  /* Loading animation */
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  .btn-blue .MuiCircularProgress-root {
    animation: pulse 1.5s ease-in-out infinite;
  }

  /* Animation entrance */
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Focus states */
  .form-group.focus {
    transform: translateY(-2px);
  }

  .form-group.focus .form-control {
    border-color: #667eea;
    box-shadow: 
      0 0 0 4px rgba(102, 126, 234, 0.15),
      0 10px 20px rgba(102, 126, 234, 0.1);
    background: rgba(255, 255, 255, 0.95);
  }

  /* Responsive fixes */
  .loginSection .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .loginSection .row {
    margin-left: 0;
    margin-right: 0;
  }

  .loginSection [class*="col-"] {
    padding-left: 0;
    padding-right: 0;
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .modern-card {
      padding: 2.5rem 2rem;
    }
  }

  /* Small tablets and large phones */
  @media (max-width: 768px) {
    .loginSection {
      padding: 1rem 0;
      min-height: 120vh
      align-items: center;
    }
    
    .modern-card {
      margin: 1rem;
      padding: 2rem 1.5rem;
      border-radius: 20px;
    }
    
    .login-title {
      font-size: 1.75rem;
    }

    .login-subtitle {
      font-size: 0.9rem;
    }

    .form-control {
      padding: 0.875rem 1rem 0.875rem 3.25rem;
      font-size: 0.95rem;
      border-radius: 14px;
    }

    .loginSection .icon {
      left: 1rem;
      font-size: 1rem;
    }

    .toggleShowPassword {
      right: 1rem;
      font-size: 1rem;
    }

    .btn-blue {
      padding: 0.875rem 1.5rem;
      font-size: 0.95rem;
      border-radius: 14px;
    }

    .signup-text {
      font-size: 0.9rem;
    }

    .loginSection .container {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
  }

  /* Mobile landscape */
  @media (max-width: 640px) and (orientation: landscape) {
    .loginSection {
      min-height: 120vh
      padding: 0.5rem 0;
    }
    
    .modern-card {
      margin: 0.5rem;
      padding: 1.5rem 1rem;
    }

    .login-title {
      font-size: 1.5rem;
    }
  }

  /* Standard mobile phones */
  @media (max-width: 480px) {
    .loginSection {
      padding: 0.5rem 0;
      min-height: 120vh
    }
    
    .modern-card {
      margin: 0.75rem;
      padding: 1.5rem 1.25rem;
      border-radius: 18px;
    }
    
    .login-title {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }

    .login-subtitle {
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-control {
      padding: 0.8rem 0.875rem 0.8rem 2.75rem;
      font-size: 0.9rem;
      border-radius: 12px;
    }

    .loginSection .icon {
      left: 0.875rem;
      font-size: 0.9rem;
    }

    .toggleShowPassword {
      right: 0.875rem;
      font-size: 1rem;
    }

    .btn-blue {
      padding: 0.8rem 1.25rem;
      font-size: 0.9rem;
      border-radius: 12px;
    }

    .or {
      margin: 1.25rem 0;
    }

    .txt {
      padding: 0 0.75rem;
      font-size: 0.8rem;
    }

    .signup-text {
      font-size: 0.85rem;
    }

    .loginSection .google-login-container {
      margin-left: 0 !important;
    }

    .loginSection .container {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }

  /* Small mobile phones */
  @media (max-width: 375px) {
    .loginSection {
      padding: 0.25rem 0;
    }
    
    .modern-card {
      margin: 0.5rem;
      padding: 1.25rem 1rem;
      border-radius: 16px;
    }
    
    .login-title {
      font-size: 1.375rem;
    }

    .login-subtitle {
      font-size: 0.8rem;
    }

    .form-control {
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      font-size: 0.875rem;
      border-radius: 10px;
    }

    .loginSection .icon {
      left: 0.75rem;
      font-size: 0.875rem;
    }

    .toggleShowPassword {
      right: 0.75rem;
      font-size: 0.95rem;
    }

    .btn-blue {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      border-radius: 10px;
    }

    .loginSection .container {
      padding-left: 0.25rem;
      padding-right: 0.25rem;
    }
  }

  /* Very small screens */
  @media (max-width: 320px) {
    .modern-card {
      margin: 0.25rem;
      padding: 1rem 0.75rem;
    }
    
    .login-title {
      font-size: 1.25rem;
    }

    .login-subtitle {
      font-size: 0.75rem;
    }

    .form-control {
      padding: 0.7rem 0.7rem 0.7rem 2.25rem;
      font-size: 0.85rem;
    }

    .loginSection .icon {
      left: 0.7rem;
      font-size: 0.85rem;
    }

    .toggleShowPassword {
      right: 0.7rem;
    }

    .btn-blue {
      padding: 0.7rem 0.875rem;
      font-size: 0.85rem;
    }

    .signup-text {
      font-size: 0.8rem;
    }
  }
`;

// Thêm styles vào head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = loginStyles;
  document.head.appendChild(styleSheet);
}

const LoginScreen = () => {
  const [inputIndex, setInputIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const context = useContext(MyContext);

  const [formfields, setFormfields] = useState({
    emailOrPhone: "",
    password: "",
    isAdmin: true,
  });

  const [errors, setErrors] = useState({});

  //const context = useContext(MyContext);
  const history = useNavigate();

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormfields({
      ...formfields,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  useEffect(() => {
    //context.setIsHideSidebarAndHeader(true);
  }, []);

  const focusInput = (index) => {
    setInputIndex(index);
  };

  // const signIn = (e) => {
  //   e.preventDefault();
  //   console.log("formfields", formfields);
  //   Login("lan@example.com", "lan123");
  // };

  // Removed useEffect that was calling getUsers() - not needed on login page
  // and requires admin privileges which causes errors

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};

    // Email or Phone validation
    if (!formfields.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone number cannot be empty";
    } else if (!validateEmail(formfields.emailOrPhone) && !validatePhone(formfields.emailOrPhone)) {
      newErrors.emailOrPhone = "Please enter a valid email or phone number";
    }

    // Password validation
    if (!formfields.password) {
      newErrors.password = "Password cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signIn = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await postData(`/api/user/login`, formfields);

      if (res.error === true) {
        setLoading(false);
        context.setAlterBox({
          open: true,
          error: true,
          message: res.message || "Login failed",
        });
        return;
      }

      if (!res.token || !res.user) {
        setLoading(false);
        context.setAlterBox({
          open: true,
          error: true,
          message: "Invalid response from server",
        });
        return;
      }

      localStorage.setItem("token", res.token);

      const user = {
        name: res.user.name,
        phone: res.user.phone,
        email: res.user.email,
        userId: res.user.id,
        isAdmin: res.user.isAdmin // Thêm thông tin admin
      };

      localStorage.setItem('user', JSON.stringify(user));

      // Google Analytics tracking - Login
      trackLogin({
        method: 'email',
        userId: res.user.id
      });

      context.setAlterBox({
        open: true,
        error: false,
        message: res.message || "Login successful",
      });

      setTimeout(() => {
        setLoading(false);
        //Redirect based on admin role
        if (res.user.isAdmin === true) {
          //Encode user data for transmission via URL
          const userData = encodeURIComponent(JSON.stringify({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone,
            isAdmin: res.user.isAdmin
          }));
          window.location.href = `http://localhost:5173/dashboard?token=${res.token}&user=${userData}`;
        } else {
          window.location.href = "/";
        }
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      context.setAlterBox({
        open: true,
        error: true,
        message: "An error occurred. Please try again later.",
      });
      setLoading(false);
    }
  };

  const handleSuccess = async (response) => {
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.error === true) {
        setLoading(false);
        context.setAlterBox({
          open: true,
          error: true,
          message: res.message || "Sign in failed",
        });
        return;
      }
      setLoading(true);
      localStorage.setItem("token", res.token);

      //Save user information to localStorage
      const user = {
        name: res.user.name,
        phone: res.user.phone,
        email: res.user.email,
        userId: res.user.id,
        isAdmin: res.user.isAdmin
      };
      localStorage.setItem('user', JSON.stringify(user));

      // Google Analytics tracking - Login with Google
      trackLogin({
        method: 'google',
        userId: res.user?.id || 'unknown'
      });

      context.setAlterBox({
        open: true,
        error: false,
        message: "Sign in successfully",
      });
      setTimeout(() => {
        setLoading(false);
        //Redirect based on admin role
        if (res.user.isAdmin === true) {
          //Encode user data for transmission via URL
          const userData = encodeURIComponent(JSON.stringify({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone,
            isAdmin: res.user.isAdmin
          }));
          window.location.href = `http://localhost:5173/dashboard?token=${res.token}&user=${userData}`;
        } else {
          window.location.href = "/";
        }
      }, 2000);
    } catch (error) {
      context.setAlterBox({
        open: true,
        error: true,
        message: "Sign in failed",
      });
      setLoading(false);
    }
  };
  const handleError = (response) => {
    console.log(response);
  };

  return (
    <>
      <section className="loginSection">
        <div className="container h-100">
          <div className="row justify-content-center align-items-center h-100">
            <div className="col-12 col-md-6">
              <div className="loginBox modern-card">
                <div className="logo text-center mb-4">
                  <Link to={"/"} className="d-inline-block mb-3">
                    <img src={Logo} alt="logo" style={{ maxWidth: "140px", height: "auto" }} />
                  </Link>
                  <h2 className="login-title">Welcome back</h2>
                  <p className="login-subtitle">Log in to explore the world of 3D printing</p>
                </div>

                <div className="wrapper">
                  <form onSubmit={signIn}>
                    <div
                      className={`form-group position-relative ${inputIndex === 0 && "focus"
                        }`}
                    >
                      <input
                        type="text"
                        className={`form-control ${errors.emailOrPhone ? 'is-invalid' : ''}`}
                        placeholder="Email or phone number"
                        onFocus={() => focusInput(0)}
                        onBlur={() => setInputIndex(null)}
                        autoFocus
                        name="emailOrPhone"
                        value={formfields.emailOrPhone}
                        onChange={onChangeInput}
                      />
                      <span className="icon">
                        <MdEmail />
                      </span>
                      {errors.emailOrPhone && <div className="invalid-feedback">{errors.emailOrPhone}</div>}
                    </div>

                    <div
                      className={`form-group position-relative ${inputIndex === 1 && "focus"
                        }`}
                    >
                      <input
                        type={`${isShowPassword === true ? "text" : "password"}`}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Password"
                        onFocus={() => focusInput(1)}
                        onBlur={() => setInputIndex(null)}
                        name="password"
                        value={formfields.password}
                        onChange={onChangeInput}
                      />
                      <span className="icon">
                        <RiLockPasswordFill />
                      </span>
                      <span
                        className="toggleShowPassword"
                        onClick={() => setIsShowPassword(!isShowPassword)}
                      >
                        {isShowPassword === true ? <IoMdEyeOff /> : <IoMdEye />}
                      <<Button
 Variant=""
 ClassName=""
 >
 <img src={GoogleIcons} width="" alt="" /> Sign in with
 Google
 </Button>n type="submit" className="btn-blue btn-big w-100" disabled={loading} style={{ color: "white" }}>
                        {loading ? (
                          <>
                            <CircularProgress size={20} color="inherit" className="me-2" />
                            Đang đăng nhập...
                          </>): (
 "Log in"
 )}utton>
                    </div>

                    <div className="form-group text-center mt-3">
                      <Link to={"/forgot-password"} className="link">
                        Quên mật khẩu
                      </Link>
                      <div className="d-flex align-items-center justify-content-center or mt-3 mb-3">
                        <span className="line"></span>
                        <span className="txt">Or</span>
                        <span className="line"></span>
                      </div>

                      {/* Login with google */}
                      <div className="google-login-container">
                        <GoogleLogin
                          onSuccess={handleSuccess}
                          onError={handleError}
                        ></GoogleLogin>
                      </div>
                      {/* <Button
                  variant="outlined"
                  className="w-100 btn-lg btn-big loginWithGoogle"
                >
                  <img src={GoogleIcons} width="20px" alt="" /> Đăng nhập bằng
                  Google
                </Button> */}
                    </div>
                  </form>
                </div>

                <div className="text-center mt-4">
                  <span className="signup-text">Don't have an account?{" "}<Link to={"/signup"} className="signup-link">
                      Đăng ký ngay
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// export default LoginScreen;
export { LoginScreen as InkMeLoginScreen };
