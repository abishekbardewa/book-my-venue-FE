import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../redux/slices/authSlice';
import { ROLES } from '../../constants/roles';

import MenuLink from './MenuLink';
import BMVLOGOG from '/logo-BMvenue.svg';

const PrivateNav = () => {
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const user = useSelector(selectUser);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		const closeMenu = () => {
			setIsMenuOpen(false);
		};

		if (isMenuOpen) {
			document.body.addEventListener('click', closeMenu);
		}

		return () => {
			document.body.removeEventListener('click', closeMenu);
		};
	}, [isMenuOpen]);

	const toggleMenu = (event) => {
		event.stopPropagation();
		setIsMenuOpen(!isMenuOpen);
	};

	const handleMenuClick = (event) => {
		event.stopPropagation();
	};
	return (
		<div>
			<div className="relative inline-flex items-center justify-center  text-gray-400  hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden md:hidden ">
				<button type="button" onClick={toggleMenu} className={`${user ? 'hover:bg-primary p-2 rounded-md' : 'hidden'}`}>
					<svg
						className={`h-6 w-6  ${isMenuOpen ? 'hidden' : 'block'}`}
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
					</svg>
					<svg
						className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`}
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				<Link to="/" className={`cursor-pointer rounded-3xl mt-2 ${user ? 'hidden' : ''}`}>
					{/* <div className="text-xl  font-bold  text-primary">BookMyVenue</div> */}
					<img src={BMVLOGOG} height="140" width="140" alt="Logo" />
				</Link>
			</div>
			<div
				className={`absolute md:hidden sm:left-[-6%] h-screen bg-white mt-2  left-[-3%] w-60 transform transition-transform ${
					isMenuOpen ? 'translate-x-0' : '-translate-x-full'
				} z-10`}
				onClick={handleMenuClick}
			>
				{isAuthenticated && user?.role === ROLES.OWNER && (
					<>
						<MenuLink to="/">Home</MenuLink>

						<MenuLink to="/owner/bookings" onClick={toggleMenu}>
							Booking
						</MenuLink>
						<MenuLink to="/owner/property" onClick={toggleMenu}>
							Property
						</MenuLink>
						<MenuLink to="/owner/profile" onClick={toggleMenu}>
							Profile
						</MenuLink>
					</>
				)}
				{isAuthenticated && user?.role === ROLES.CUSTOMER && (
					<>
						<MenuLink to="/" onClick={toggleMenu}>
							Home
						</MenuLink>
						<MenuLink to="/customer/my-bookings" onClick={toggleMenu}>
							My Booking
						</MenuLink>
						<MenuLink to="/customer/profile" onClick={toggleMenu}>
							Profile
						</MenuLink>
					</>
				)}
			</div>
			<div className="hidden md:ml-6 md md:block">
				<div className="flex space-x-4">
					{isAuthenticated && user?.role === ROLES.OWNER && (
						<>
							<MenuLink to="/owner/bookings">Booking</MenuLink>
							<MenuLink to="/owner/property">Property</MenuLink>
							<MenuLink to="/owner/profile">Profile</MenuLink>
						</>
					)}
					{isAuthenticated && user?.role === ROLES.CUSTOMER && (
						<>
							<MenuLink to="/customer/my-bookings">My Booking</MenuLink>
							<MenuLink to="/customer/profile">Profile</MenuLink>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default PrivateNav;
