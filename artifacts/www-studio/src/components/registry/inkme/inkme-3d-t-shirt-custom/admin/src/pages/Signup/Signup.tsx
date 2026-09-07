import * as React from 'react'; // originally: import { useContext, useState } from 'react';
import Logo from "../../assets/images/logo.webp";
import { MyContext } from "../../App";
import * as React from 'react'; // originally: import { useEffect } from 'react';
import patern from "../../assets/images/pattern.webp";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff, IoMdHome } from "react-icons/io";
import Button from '@mui/material/Button';
import { Link, useNavigate } from "react-router-dom";
import GoogleIcons from "../../assets/images/GoogleIcons.png";
import { FaUserCircle } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FaPhone } from "react-icons/fa6";
import { postData } from "../../utils/api";
import { CircularProgress } from "@mui/material";

const Signup = () => {
    const [inputIndex, setInputIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

    const [formfields, setFormfields] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        isAdmin: true
    })

    const context = useContext(MyContext)
    const history = useNavigate();

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, []);

    const focusInput = (index) => {
        setInputIndex(index);
    }

    const onChangeInput = (e) => {
        setFormfields({
            ...formfields,
            [e.target.name]: e.target.value
        });
    }

    const signUp = (e) => {
        e.preventDefault();
        try {
            if (formfields.name === "") {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "name can't be blank"
                })
                return false;
            }
            if (formfields.phone === "") {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "Phone can't be blank"
                })
                return false;
            }
            if (formfields.email === "") {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "Email can't be blank"
                })
                return false;
            }
            if (formfields.password === "") {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "Password can't be blank"
                })
                return false;
            }
            if (formfields.confirmPassword === "") {
                context.setAlterBox({
                    open: true,
                    error: true,
                    message: "Confirm Password can't be blank"
                })
                return false;
            }

            setLoading(true);

            postData("/api/user/signup", formfields).then((res) => {
                if (res.error !== true) {
                    context.setAlterBox({
                        open: true,
                        error: true,
                        message: "User created successfully"
                    })

                    setTimeout(() => {
                        setLoading(false);
                        history("/login");
                    }, 2000);
                } else {
                    context.setAlterBox({
                        open: true,
                        error: false,
                        message: res.message
                    })
                    setLoading(false);
                }
            })

        } catch (error) {
            console.log(error);
            setLoading(false);
        }

    }

    return (
        <>
            <img src={patern} alt="pattern" className="loginPattern" />
            <section className="loginSection signupSection">
                <div className="row">
                    <div className="col-md-8 d-flex align-items-center justify-content-center flex-column part1">
                        <h1>Example title &<span className="text-sky"> Admin dashboard</span></h1>
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                            when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                            It has survived not only five centuries, but also the leap into electronic typesetting,
                            remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>

                        <div className="w-100 mt-4">
                            <Link to={'/'}>
                                <Button className="btn-blue btn-lg btn-big"><IoMdHome />Home</Button>
                            </Link>

                        </div>

                    </div>
                    <div className="col-md-4 pr-0">
                        <div className="loginBox">
                            <div className="logo text-center">
                                <img src={Logo} alt="logo" width="60px" />
                                <h5 className="">Register new account</h5>
                            </div>

                            <div className="wrapper mt-3 card border">
                                <form onSubmit={signUp}>
                                    <div className={`form-group position-relative ${inputIndex === 0 && 'focus'}`}>
                                        <span className="icon"><FaUserCircle /></span>
                                        <input type="text" className="form-control"
                                            placeholder="Full name" onFocus={() => focusInput(0)}
                                            onBlur={() => setInputIndex(null)} autoFocus
                                            name="name" onChange={onChangeInput} />
                                    </div>

                                    <div className={`form-group position-relative ${inputIndex === 1 && 'focus'}`}>
                                        <span className="icon"><MdEmail /></span>
                                        <input type="text" className="form-control"
                                            placeholder="Email" onFocus={() => focusInput(1)}
                                            onBlur={() => setInputIndex(null)}
                                            name="email" onChange={onChangeInput} />
                                    </div>

                                    <div className={`form-group position-relative ${inputIndex === 2 && 'focus'}`}>
                                        <span className="icon"><FaPhone /></span>
                                        <input type="text" className="form-control"
                                            placeholder="Số điện thoại" onFocus={() => focusInput(2)}
                                            onBlur={() => setInputIndex(null)}
                                            name="phone" onChange={onChangeInput} />
                                    </div>

                                    <div className={`form-group position-relative ${inputIndex === 3 && 'focus'}`}>
                                        <span className="icon"><RiLockPasswordFill /></span>
                                        <input type={`${isShowPassword === true ? 'text' : 'password'}`} className="form-control"
                                            placeholder="Enter password" onFocus={() => focusInput(3)}
                                            onBlur={() => setInputIndex(null)}
                                            name="password" onChange={onChangeInput} />

                                        <span className="toggleShowPassword" onClick={() => setIsShowPassword(!isShowPassword)}>
                                            {
                                                isShowPassword === true ? <IoMdEyeOff /> : <IoMdEye />
                                            }

                                        </span>
                                    </div>

                                    <div className={`form-group position-relative ${inputIndex === 4 && 'focus'}`}>
                                        <span className="icon"><IoShieldCheckmarkSharp /></span>
                                        <input type={`${isShowConfirmPassword === true ? 'text' : 'password'}`} className="form-control"
                                            placeholder="Confirm password" onFocus={() => focusInput(4)}
                                            onBlur={() => setInputIndex(null)}
                                            name="confirmPassword" onChange={onChangeInput} />

                                        <span className="toggleShowPassword" onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}>
                                            {
                                                isShowConfirmPassword === true ? <IoMdEyeOff /> : <IoMdEye />
                                            }

                                        </span>
                                    </div>

                                    <FormControlLabel control={<Checkbox />}
                                        label="I agree to the terms & services" />

                                    <div className="form-group">
                                        <Button type="submit" className="btn-blue btn-big w-100">
                                            {
                                                loading === false ? <CircularProgress /> : 'Sign up'
                                            }
                                        </Button>
                                    </div>

                                    <div className="form-group text-center mt-3">
                                        <div className="d-flex align-items-center justify-content-center or mt-3 mb-3">
                                            <span className="line"></span>
                                            <span className="txt">Or</span>
                                            <span className="line"></span>
                                        </div>

                                        <Button type="submit" variant="outlined" className="w-100 btn-lg btn-big loginWithGoogle">
                                            <img src={GoogleIcons} width="20px" alt="" /> Đăng nhập bằng Google

                                        </Button>
                                    </div>
                                </form>
                                <div className="wrapper mt-3 card border footer p-0">
                                    <span className="text-center">Already have an account?<Link to={'/login'} className="link color">Đăng nhập</Link>
                                    </span>
                                </div>
                            </div>


                        </div >
                    </div>
                </div>
            </section >

        </>
    )
}

// export default Signup
export { Signup as InkMeSignup };
