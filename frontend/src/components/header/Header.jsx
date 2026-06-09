import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { GiHamburgerMenu } from 'react-icons/gi';
import { FaSignInAlt } from 'react-icons/fa';
import { FaSignOutAlt } from 'react-icons/fa';
import { MdAccountCircle } from 'react-icons/md';
import { RiShoppingBagFill } from 'react-icons/ri';
import { BsChatDots } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { FaShoppingCart } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import SearchBox from '../SearchBox';
import { useLogoutMutation } from '../../slices/usersApiSlice';
import { logout } from '../../slices/authSlice';
import { resetCart, clearCartItems } from '../../slices/cartSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './header.css';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [openMenu, setOpenMenu] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const open = () => {
    setOpenMenu(true);
    setShowLogout(true);
  };
  const close = () => {
    setOpenMenu(false);
    setShowLogout(true);
  };

  const handleOpenProfile = () => {
    setShowLogout((prev) => !prev);
  };
  const handleCloseProfile = () => {
    setOpenMenu(false);
    setShowLogout((prev) => !prev);
  };

  const [signout] = useLogoutMutation();

  const handleSignout = async () => {
    try {
      await signout().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      dispatch(clearCartItems());
      navigate('/login');
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setShowLogout(true);
  }, []);

  const totalItemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <header>
        <div className='navigation'>
          <Link to='/' onClick={close}>
            <h2 id='logo'>DESSERTS</h2>
          </Link>
          <nav className={`nav ${openMenu ? 'active' : ''}`}>
            <li className={location.pathname === '/menu' ? 'active-page' : ''}>
              <Link
                onClick={close}
                className={location.pathname === '/menu' ? 'active-page' : ''}
                to='/menu'
              >
                Menu
              </Link>
            </li>
            <li
              className={
                location.pathname === '/resturant' ? 'active-page' : ''
              }
            >
              <Link
                onClick={close}
                className={
                  location.pathname === '/resturant' ? 'active-page' : ''
                }
                to='/resturant'
              >
                Restaurants
              </Link>
            </li>
            <li
              className={location.pathname === '/offers' ? 'active-page' : ''}
            >
              <Link
                onClick={close}
                className={location.pathname === '/offers' ? 'active-page' : ''}
                to='/offers'
              >
                Offers
              </Link>
            </li>
            <li
              className={location.pathname === '/careers' ? 'active-page' : ''}
            >
              <Link
                onClick={close}
                className={
                  location.pathname === '/careers' ? 'active-page' : ''
                }
                to='/careers'
              >
                Careers
              </Link>
            </li>
          </nav>
          {location.pathname === '/menu' && (
            <div className='md-search'>
              <SearchBox />
            </div>
          )}
        </div>
        <div className='profile-menu'>
          {userInfo && !userInfo.isAdmin ? (
          <>
            {location.pathname !== '/profile' && <small id='logo' onClick={handleOpenProfile}>
              Hi {userInfo?.firstname?.toUpperCase()}
            </small>}
          </>
          ) : userInfo ? (
            ''
          ) : (
            <MdAccountCircle
              className='profile-icon'
              onClick={handleOpenProfile}
            />
          )}
          {userInfo && userInfo.isAdmin && (
            <small id='logo' onClick={handleOpenProfile}>
              Hi {userInfo?.firstname?.toUpperCase()}
            </small>
          )}
          <div className='shopping'>
            {totalItemCount > 0 && (
              <div className='basket-total'>{totalItemCount}</div>
            )}
            <Link to={'/cart'}>
              <FaShoppingCart className='shopping-cart' />
            </Link>
          </div>
          {openMenu ? (
            <IoMdClose className='close' onClick={close} />
          ) : (
            <GiHamburgerMenu className='hamburger' onClick={open} />
          )}
        </div>
      </header>
      <div className='register'>
        <div className={showLogout ? 'profile active' : 'profile'}>
          {userInfo ? (
            <div className='account-profile' onClick={handleOpenProfile}>
              <FaSignOutAlt className='account-profile-icon' />
              <Link onClick={handleSignout}>
                <p>Sign Out</p>
              </Link>
            </div>
          ) : (
            <Link
              to='/login'
              className='account-profile'
              onClick={handleCloseProfile}
            >
              <FaSignInAlt className='account-profile-icon' />
              <p>Sign In</p>
            </Link>
          )}
          {userInfo && !userInfo.isAdmin && (
            <Link
              to='/profile'
              className='account-profile'
              onClick={handleCloseProfile}
            >
              <MdAccountCircle className='account-profile-icon' />
              <p>My Account</p>
            </Link>
          )}
          {userInfo && userInfo.isAdmin && (
            <Link
              to='/admin/userlist'
              className='account-profile'
              onClick={handleCloseProfile}
            >
              <RiShoppingBagFill className='account-profile-icon' />
              <p>User</p>
            </Link>
          )}
          {userInfo && userInfo.isAdmin && (
            <Link
              to='/admin/menulist'
              className='account-profile'
              onClick={handleCloseProfile}
            >
              <RiShoppingBagFill className='account-profile-icon' />
              <p>Menu</p>
            </Link>
          )}
          {userInfo && userInfo.isAdmin && (
            <Link
              to='/admin/orderlist'
              className='account-profile'
              onClick={handleCloseProfile}
            >
              <RiShoppingBagFill className='account-profile-icon' />
              <p>Orders</p>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
