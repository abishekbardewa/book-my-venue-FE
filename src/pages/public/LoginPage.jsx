import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../services/axios.service';

import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import OtpModel from './OtpModel';
import Button from '../../components/common/Button';
import OnboardingModal from './OnboardingModal';
import InputField from '../../components/forms/InputField';
import { handleLoginSuccess } from '../../services/user.service';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';
import { ROLES } from '../../constants/roles';
import { toast } from 'react-toastify';

const LoginPage = ({ isOpen, onClose }) => {
	const [isOtpSent, setIsOtpSent] = useState(false);
	const [isNewUser, setIsNewUser] = useState(false);
	const [loading, setLoading] = useState(false);
	const [newUser, setNewUser] = useState({});
	const [email, setEmail] = useState('');
	const [termsChecked, setTermsChecked] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	let {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm();
	const [generalError, setGeneralError] = useState('');

	const onSubmit = async (values) => {
		if (!termsChecked) {
			toast.error('You must agree to the terms and conditions before proceeding.');
			return;
		}
		try {
			setEmail(values.email);
			await axiosInstance.post('/auth/otp', values);
			setIsOtpSent(true);
		} catch (error) {
			if (error.response && error.response.status === 401) {
				setGeneralError(error.response.data.message);
			} else {
				setGeneralError('Login failed');
			}
		}
	};

	const handleGoogleLogin = async (response) => {
		setLoading(true);
		try {
			const { email, family_name, given_name, picture } = jwtDecode(response.credential);

			console.log(jwtDecode(response.credential));
			const {
				data: { data },
			} = await axiosInstance.post('/auth/google', {
				email: email,
				firstName: given_name,
				lastName: family_name,
				avatar: picture,
			});
			if (data.isNewUser) {
				setNewUser(data);
				setIsNewUser(true);
			} else {
				handleLoginSuccess(data);
				dispatch(setUser(data));
				if (data.role === ROLES.OWNER) {
					navigate('/owner/property');
				} else {
					onClose();
				}
			}
		} catch (error) {
			if (error.response && error.response.status === 401) {
				setGeneralError(error.response.data.message);
			} else {
				setGeneralError('Login failed');
			}
		} finally {
			setLoading(false);
		}
	};

	const goto = (url) => {
		window.open(url, '_blank');
	};

	return (
		isOpen && (
			<div className="relative bg-white rounded-lg shadow">
				{!isOtpSent ? (
					!isNewUser ? (
						<>
							<div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
								<h3 className="text-xl font-semibold text-gray-900">Log in or sign up</h3>

								<button
									type="button"
									onClick={onClose}
									className="end-2.5 text-gray-400 bg-transparent hover:bg-primary hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
								>
									<svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
										<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
									</svg>
									<span className="sr-only">Close modal</span>
								</button>
							</div>
							<div className="text-gray-600 text-sm p-4 pb-0 text-center">
								Use <em className="text-primary">anything@venue.com</em> for demo account
							</div>

							<div className="p-4 md:p-5 ">
								<form className="space-y-4 mb-4" onSubmit={handleSubmit(onSubmit)}>
									<div>
										<InputField
											label="Email"
											id="email"
											name="email"
											type="email"
											register={register}
											required="Email is required"
											error={errors?.email}
										/>
										<p className="text-sm text-red-500">{errors.email?.message}</p>
									</div>
									{generalError && <p className="text-red-500">{generalError}</p>}
									<div className="mt-6 flex items-start">
										<input
											id="terms"
											type="checkbox"
											checked={termsChecked}
											onChange={(e) => {
												console.log(e);
												setTermsChecked(e.target.checked);
											}}
											className="h-5 w-5 mt-[5px] rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
										/>
										<div className="ml-2">
											<label htmlFor="terms" className="text-sm font-medium text-gray-600">
												I have read and understood the{' '}
												<span onClick={() => goto('/privacy-policy')} className="text-indigo-500 underline underline-offset-3 cursor-pointer">
													privacy policy{' '}
												</span>{' '}
												and the{' '}
												<span onClick={() => goto('/terms-of-service')} className="text-indigo-500 underline underline-offset-3 cursor-pointer">
													terms of service.
												</span>
											</label>
										</div>
									</div>
									<Button
										buttonType="submit"
										size="md"
										variant="filled"
										innerClass="w-[100%] bg-primary"
										innerTextClass="text-white"
										disabled={isSubmitting || loading}
										loading={isSubmitting || loading}
									>
										{isSubmitting ? 'Loading' : 'Continue'}
									</Button>
								</form>
								<div className="mb-6 mt-6 flex items-center justify-center">
									<div className="h-[1px] flex-1 bg-gray-100"></div>
									<p className="mx-2 min-w-fit text-sm text-gray-600">OR</p>
									<div className="h-[1px] flex-1 bg-gray-100"></div>
								</div>
								<div className="flex flex-1 items-center justify-center ">
									<GoogleLogin
										onSuccess={handleGoogleLogin}
										onError={() => {
											console.log('Login Failed');
										}}
										text="signup_with"
										shape="pill"
										useOneTap
										size="large"
									/>
								</div>
							</div>
						</>
					) : (
						<OnboardingModal user={newUser} onClose={onClose} />
					)
				) : (
					<>
						<OtpModel email={email} onPrev={() => setIsOtpSent(false)} resendOtp={onSubmit} onClose={onClose} />
					</>
				)}
			</div>
		)
	);
};

export default LoginPage;
