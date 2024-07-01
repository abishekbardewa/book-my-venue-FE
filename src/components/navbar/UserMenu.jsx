import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, selectIsAuthenticated, selectUser } from '../../redux/slices/authSlice';
import { axiosPrivate } from '../../services/axios.service';
import { FaAngleDown, FaArrowRightFromBracket } from 'react-icons/fa6';
import LoginPage from '../../pages/public/LoginPage';
import Button from '../common/Button';
import { PiUserCircle } from 'react-icons/pi';

export default function UserMenu() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const user = useSelector(selectUser);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const buttonRef = useRef(null);
	const [showLoginModal, setShowLoginModal] = useState(false);

	const handleLogout = async () => {
		try {
			const { data } = await axiosPrivate.post('/auth/logout', {});

			dispatch(clearUser());
			navigate('/');
		} catch (err) {
			console.log(err);
		}
	};

	const getInitials = (user) => {
		const firstInitial = user.firstName.charAt(0).toUpperCase();
		const lastInitial = user.lastName.charAt(0).toUpperCase();
		return `${firstInitial}${lastInitial}`;
	};

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

	const getScrollbarWidth = () => {
		const outer = document.createElement('div');
		outer.style.visibility = 'hidden';
		outer.style.overflow = 'scroll';
		outer.style.width = '100px';
		outer.style.position = 'absolute';
		outer.style.top = '-9999px';
		document.body.appendChild(outer);

		const scrollbarWidth = outer.offsetWidth - outer.clientWidth;
		document.body.removeChild(outer);
		return scrollbarWidth;
	};

	useEffect(() => {
		const scrollbarWidth = getScrollbarWidth();
		if (showLoginModal) {
			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		} else {
			document.body.style.overflow = 'auto';
			document.body.style.paddingRight = '0px';
		}

		return () => {
			document.body.style.overflow = 'auto';
			document.body.style.paddingRight = '0px';
		};
	}, [showLoginModal]);

	const toggleMenu = (event) => {
		event.stopPropagation();
		setIsMenuOpen(!isMenuOpen);
	};

	const handleMenuClick = (event) => {
		event.stopPropagation();
	};

	return (
		<div ref={buttonRef} className="relative ml-3">
			{isAuthenticated && user ? (
				<>
					<button
						type="button"
						onClick={toggleMenu}
						className="  rounded-full  text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 hover:opacity-70 flex items-center space-x-1.5 transition-opacity"
					>
						{!!user?.avatar ? (
							<img src={user?.avatar} alt="Profile photo" className="inline-block h-10 w-10 rounded-full object-cover" />
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-gray-200 font-semibold uppercase text-gray-700  ">
								{getInitials(user)}
							</div>
						)}
						<FaAngleDown className={`hidden transition-transform duration-[.2s] md:block ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
					</button>

					<div
						className={`absolute right-0 top-full z-20 w-48 origin-top-right overflow-hidden rounded-lg bg-white shadow-lg transition-opacity duration-200 opacity- pointer-events-auto ${
							isMenuOpen ? '' : 'hidden'
						}`}
						onClick={handleMenuClick}
					>
						<div className="space-y-3 bg-gray-25 p-4">
							<div>
								<p className="text-lg font-semibold break-words">
									{user?.firstName} {user?.lastName}
								</p>
								<p className="text-sm capitalize text-base-secondary-text"> {user?.role.toLowerCase()} </p>
							</div>
						</div>
						<div>
							<ul>
								<li className="flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50" onClick={handleLogout}>
									<FaArrowRightFromBracket className=" text-base-secondary-text " />
									Logout
								</li>
							</ul>
						</div>
					</div>
				</>
			) : (
				<div className="flex flex-row items-center gap-2 ">
					<Button
						buttonType="button"
						size="sm"
						variant="outline"
						innerClass="w-full md:w-28  border border-white "
						innerTextClass="text-primary"
						onClick={() => setShowLoginModal(true)}
					>
						Log In
					</Button>

					<Button
						startIcon={<PiUserCircle className="!w-5 !h-5" />}
						buttonType="button"
						size="sm"
						variant="outline"
						innerClass="w-full md:w-32  border border-primary whitespace-nowrap"
						innerTextClass="text-primary"
						onClick={() => setShowLoginModal(true)}
					>
						Sign Up
					</Button>
				</div>
			)}
			{showLoginModal && (
				<div className="flex bg-black bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-screen">
					<div className="p-4 w-full max-w-md max-h-full">
						<LoginPage isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
					</div>
				</div>
			)}
		</div>
	);
}
