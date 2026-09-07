import * as React from 'react'; // originally: import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import { baseUrl, postData } from "../../utils/api";
import { MyContext } from "../../context/MyContext";
import Logo from "../../img/logo.webp";
import patern from "../../img/pattern.webp";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

// CSS cho trang reset password
const resetPasswordStyles = `
  .resetPasswordSection {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
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

  .reset-password-box {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 3rem 2.5rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    z-index: 10;
  }

  .reset-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .reset-subtitle {
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

  .resetPasswordSection .icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    z-index: 1;
  }

  .toggleShowPassword {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #a0aec0;
    transition: color 0.3s ease;
  }

  .toggleShowPassword:hover {
    color: #667eea;
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

  @media (max-width: 768px) {
    .reset-password-box {
      margin: 1rem;
      padding: 2rem 1.5rem;
    }
    
    .reset-title {
      font-size: 1.5rem;
    }
  }
`;

// Thêm styles vào head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = resetPasswordStyles;
  document.head.appendChild(styleSheet);
}

const ResetPassword = () => {
  //   const [searchParams] = useSearchParams();
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inputIndex, setInputIndex] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const context = useContext(MyContext);

  useEffect(() => {
    // const token = searchParams.get("token");
    if (!token) {
      context.setAlterBox({
        open: true,
        error: true,
        message: "Invalid or expired reset link",
      });
      navigate("/login");
    }
  }, [context, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      context.setAlterBox({
        open: true,
        error: true,
        message: "Please fill in all fields",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      context.setAlterBox({
        open: true,
        error: true,
        message: "Passwords do not match",
      });
      return;
    }

    setLoading(true);
    try {
      //   const token = searchParams.get("token");
      const response = await postData(`/api/user/reset-password`, {
        token,
        password: formData.password,
      });

      if (response.error === true) {
        context.setAlterBox({
          open: true,
          error: true,
          message: response.message || "Failed to reset password",
        });
      } else {
        context.setAlterBox({
          open: true,
          error: false,
          message: "Password has been reset successfully",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      context.setAlterBox({
        open: true,
        error: true,
        message: "An error occurred. Please try again.",
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
      <section className="resetPasswordSection">
        <div className="container">
          <div className="row justify-content-center align-items-center min-vh-100">
            <div className="col-lg-5 col-md-7">
              <div className="reset-password-box modern-card">
                <div className="logo text-center mb-4">
                  <img src={Logo} alt="logo" width="80px" />
                  <h2 className="reset-title">Reset password</h2>
                  <p className="reset-subtitle">Create a new password for your account</p>
                </div>

                <div className="wrapper">
                  <form onSubmit={handleSubmit}>
                    <div
                      className={`form-group position-relative ${inputIndex === 0 && "focus"
                        }`}
                    >
                      <span className="icon">
                        <RiLockPasswordFill />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="New password"
                        onFocus={() => focusInput(0)}
                        onBlur={() => setInputIndex(null)}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <span
                        className="toggleShowPassword"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                      </span>
                    </div>

                    <div
                      className={`form-group position-relative ${inputIndex === 1 && "focus"
                        }`}
                    >
                      <span className="icon">
                        <RiLockPasswordFill />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Confirm new password"
                        onFocus={() => focusInput(1)}
                        onBlur={() => setInputIndex(null)}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <span
                        className="toggleShowPassword"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                      </span>
                    </div>

                    <div className="form-group">
                      <Button type="submit" className="btn-blue btn-big w-100">
                        {loading ? <CircularProgress /> : "Reset password"}
                      </Button>
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

// export default ResetPassword;
export { ResetPassword as InkMeResetPassword };
