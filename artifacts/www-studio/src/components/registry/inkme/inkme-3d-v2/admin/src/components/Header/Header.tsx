import * as React from 'react';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import Button from '@mui/material/Button';
import { MdMenuOpen } from "react-icons/md";
import { MdOutlineMenu } from "react-icons/md";
import SearchBox from "../SearchBox";
import { CiLight } from "react-icons/ci";
import { IoCartOutline, IoShieldHalfSharp } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaRegBell } from "react-icons/fa6";

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Logout from '@mui/icons-material/Logout';
import { Person2 } from "@mui/icons-material";
import { MyContext } from "../../App";
import UserAvatarImgComponent from "../UserAvatarImg";

const Header = () => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenNotificationsDrop, setIsOpenNotificationsDrop] = useState(false);
  const openMyAcc = Boolean(anchorEl);
  const OpenNotifications = Boolean(isOpenNotificationsDrop);

  const context = useContext(MyContext);
  const history = useNavigate();

  const handleOpenMyAccDrop = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMyAccDrop = () => {
    setAnchorEl(null);
  };

  const handleOpenNotificationsDrop = () => {
    setIsOpenNotificationsDrop(true);
  }
  const handleCloseNotificationsDrop = () => {
    setIsOpenNotificationsDrop(false);
  }

  const logout = () => {
    localStorage.clear();

    setAnchorEl(null);

    context.setAlterBox({
      open: true,
      error: false,
      message: "Logout successfully"
    });
    
    setTimeout(() => {
      history('/login');
    }, 1000);
  }


  return (
    <>
      <header className="d-flex align-items-center">
        <div className="container-fluid w-100 ">
          <div className="d-flex align-items-center w-100">
            {/* Logo */}
            <div className="col-sm-2 part1">
              <Link to="/" className="d-flex align-items-center logo">
                <img src={logo} alt="logo" style={{width: '30px', height: '30px'}} />
                <span className="logo-text ml-2">INKME-3D</span>
              </Link>
            </div>

            <div className="col-sm-3 d-flex align-items-center part2 pl-4 ">
              <Button className="rounded-circle mr-3"
                onClick={() => context.setIsToggleSidebar(!context.isToggleSidebar)}>
                {
                  context.isToggleSidebar === false ? <MdMenuOpen /> : <MdOutlineMenu />
                }
              </Button>
              <SearchBox />
            </div>

            <div className="col-sm-7 d-flex align-items-center justify-content-end gap-2 part3 ">
              <Button className="rounded-circle mr-3" onClick={() => context.setThemeMode(!context.themeMode)}>
                <CiLight />
              </Button>
              <Button className="rounded-circle mr-3">
                <IoCartOutline />
              </Button>
              <Button className="rounded-circle mr-3">
                <MdOutlineMailOutline />
              </Button>

              <div className="dropdownWrapper position-relative">
                <Button className="rounded-circle mr-3"
                  onClick={handleOpenNotificationsDrop}>
                  <FaRegBell />
                </Button>

                <Menu
                  anchorEl={isOpenNotificationsDrop}
                  className="notifications-menu dropdown-list"
                  id="notifications"
                  open={OpenNotifications}
                  onClose={handleCloseNotificationsDrop}
                  onClick={handleCloseNotificationsDrop}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >

                  <div className="head pl-3 pb-0">
                    <h4>Orders (12)</h4>
                  </div>

                  <Divider className="mb-1" />

                  <div className="scroll">
                    <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <UserAvatarImgComponent img={'https://mironcoder-hotash.netlify.app/images/avatar/01.webp'} />
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Example notification<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Example notification<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Example notification<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Example notification<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Example notification<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Example notification<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Notification example<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Notification example<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Notification example<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem> <MenuItem onClick={handleCloseMyAccDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt="" />
                            </span>
                          </div>
                        </div>

                        <div className="dropdown-info">
                          <h4>
                            <span>
                              <b>Thông báo </b>Notification example<b>order</b>
                            </span>
                          </h4>
                          <p className="text-sky">A few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem>
                  </div>

                  <div className="pl-3 pr-3 pt-3 pb-1 d-flex justify-content-center">
                    <button className="btn btn-blue">View all notifications</button>
                  </div>

                </Menu>
              </div>

              {
                context.isLogin !== true ?
                  <Link to={'/login'}>
                    <Button className="btn-blue btn-lg">Log in</Button>
                  </Link>
                  :
                  <div className="myAccWrapper">
                    <button className="myAcc d-flex align-items-center" onClick={handleOpenMyAccDrop}>
                      <div className="userImg">
                        <span className="rounded-circle">
                          {context.user?.name?.charAt(0)}
                        </span>
                      </div>

                      <div className="userInfo">
                        <h4>{context.user?.name}</h4>
                        <p className="mb-0">{context.user?.email}</p>
                      </div>

                    </button>

                    <Menu
                      anchorEl={anchorEl}
                      id="account-menu"
                      open={openMyAcc}
                      onClose={handleCloseMyAccDrop}
                      onClick={handleCloseMyAccDrop}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem onClick={handleCloseMyAccDrop}>
                        <ListItemIcon>
                          <Person2 fontSize="small" />
                        </ListItemIcon>
                        My account
                      </MenuItem><MenuItem onClick={handleCloseMyAccDrop}>
                        <ListItemIcon>
                          <IoShieldHalfSharp />
                        </ListItemIcon>
                        Reset Password
                      </MenuItem>
                      <MenuItem onClick={logout}>
                        <ListItemIcon>
                          <Logout fontSize="small" />
                        </ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>

                  </div>
              }



            </div>

          </div>
        </div>
      </header>

    </>
  )
}

// export default Header;
export { Header as InkMeHeader };
