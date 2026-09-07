import * as React from 'react'; // originally: import { useState, useContext } from 'react';
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import { baseUrl, postData } from "../../utils/api";
import { MyContext } from "../../context/MyContext";
import Logo from "../../img/logo/inkme-logo-gradient.png";
import patern from "../../img/pattern.webp";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

// CSS cho trang forgot password
const forgotPasswordStyles = `
  .forgotPasswordSection {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 120vh;
    position: relative;
    overflow: hidden;
  }

  .loginPattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
    z-index: 1;
  }

  .forgot-password-box {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 3rem 2.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    z-index: 10;
  }

  .forgot-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .forgot-subtitle {
    color: #718096;
    font-size: 1rem;
    margin-bottom: 0;
    line-height: 1.5;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-control {
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.75rem 1rem 0.75rem 3rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f7fafc;
  }

  .form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }

  .forgotPasswordSection .icon {
    position: absolute;
    left: 1rem;
    top: 0.75rem;
    transform: translateY(0);
    color: #a0aec0;
    z-index: 1;
    pointer-events: none;
  }

  .btn-blue {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    padding: 0.875rem 2rem;
    font-weight: 600;
    text-transform: none;
    font-size: 1rem;
    transition: all 0.3s ease;
    color: white;
  }

  .btn-blue:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    color: white;
  }

  .back-link {
    color: #764ba2;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .back-link:hover {
    color:rgb(26, 8, 45);
    text-decoration: none;
    transform: translateX(-2px);
  }

  /* Error states */
  .form-control.is-invalid {
    border-color: #e53e3e !important;
    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1) !important;
  }

  .form-control.is-invalid:focus {
    border-color: #e53e3e !important;
    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2) !important;
  }

  .invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #e53e3e;
    font-weight: 500;
    background: rgba(229, 62, 62, 0.1);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border-left: 3px solid #e53e3e;
  }

  @media (max-width: 768px) {
    .forgot-password-box {
      margin: 1rem;
      padding: 2rem 1.5rem;
    }
    
    .forgot-title {
      font-size: 1.5rem;
    }

    .forgotPasswordSection .icon {
      top: 0.75rem;
    }
  }
`;

// Thêm styles vào head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = forgotPasswordStyles;
  document.head.appendChild(styleSheet);
}

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputIndex, setInputIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const context = useContext(MyContext);

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

    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone number cannot be left blank";
    } else if (!validateEmail(emailOrPhone) && !validatePhone(emailOrPhone)) {
      newErrors.emailOrPhone = "Please enter a valid email or phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmailOrPhone(value);

    // Clear error when user starts typing
    if (errors.emailOrPhone) {
      setErrors({
        ...errors,
        emailOrPhone: ""
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await postData(`/api/user/forgot-password`, {
        emailOrPhone: emailOrPhone.trim(),
      });

      if (response.error === true) {
        context.setAlterBox({
          open: true,
          error: true,
          message: response.message || "Request processing failed",
        });
      } else {
        context.setAlterBox({
          open: true,
          error: false,
          message: response.message || "The password reset link has been sent to your email",
        });
        setEmailOrPhone("");
        setErrors({});
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      context.setAlterBox({
        open: true,
        error: true,
        message: "An error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const focusInput = (index) => {
    setInputIndex(index);
  };

  return (
    <>
      <img src={patern} alt="pattern" className="loginPattern" />
      <section className="forgotPasswordSection">
        <div className="container">
          <div className="row justify-content-center align-items-center min-vh-100">
            <div className="col-lg-5 col-md-7">
              <div className="forgot-password-box modern-card">
                <div className="logo text-center mb-4">
                  <img src={Logo} alt="logo" width="150px" />
                  <h2 className="forgot-title">Forgot password?</h2>
                  <p className="forgot-subtitle">Enter email or phone number to receive a password reset link</p>
                </div>

                <div className="wrapper">
                  <form onSubmit={handleSubmit}>
                    <div
                      className={`form-group position-relative ${inputIndex === 0 && "focus"
                        }`}
                    >
                      <span className="icon">
                        <MdEmail />
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.emailOrPhone ? 'is-invalid' : ''}`}
                        placeholder="Enter email or phone number"
                        onFocus={() => focusInput(0)}
                        onBlur={() => setInputIndex(null)}
                        value={emailOrPhone}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.emailOrPhone && <div className="invalid-feedback">{errors.emailOrPhone}</div>}
                    </div>

                    <div className="form-group">
                      <Button type="submit" className="btn-blue btn-big w-100" disabled={loading}>
                        {loading ? (
                          <>
                            <CircularProgress size={20} color="inherit" className="me-2" />
                            Đang xử lý...
                          </>): (
 "Send request"
 )} </Button>
                    </div>

                    <div className="form-group text-center mt-3">
                      <Link to="/login" className="back-link">← Back to login</Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// export default ForgotPassword;
export { ForgotPassword as InkMeForgotPassword };
