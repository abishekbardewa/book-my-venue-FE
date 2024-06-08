import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { axiosInstance } from '../../services/axios.service';
import useRedirect from '../../hooks/useRedirect';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import OtpModel from './OtpModel';
import Button from '../../components/common/Button';
import OnboardingModal from './OnboardingModal ';
import InputField from '../../components/forms/InputField';
import { handleLoginSuccess } from '../../services/user.service';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';

const LoginPage = ({ isOpen, onClose }) => {

	const location = useLocation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');

	// useRedirect(id);

	const [isOtpSent, setIsOtpSent] = useState(false);
	const [isNewUser, setIsNewUser] = useState(false);
	const [newUser, setNewUser] = useState({});
	const [email, setEmail] = useState('');
	const navigate = useNavigate();
    const dispatch = useDispatch();

	useRedirect(id);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm();
	const [generalError, setGeneralError] = useState('');

	const redirectUrl = new URLSearchParams(location.search).get('redirect');

	const onSubmit = async (values) => {
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
		try {
			const { email, family_name, given_name, picture } = jwtDecode(response.credential)
			// console.log(response.credential);
			console.log(jwtDecode(response.credential));
			const { data: { data } } = await axiosInstance.post('/auth/google', {
				email: email,
				firstName: given_name,
				lastName: family_name,
				avatar: picture
			});
			if (data.isNewUser) {
				setNewUser(data);
				setIsNewUser(true);
			}
			else {
				handleLoginSuccess(data);
				dispatch(setUser(data));
				if (data.role === ROLES.OWNER) {
					navigate('/owner/dashboard');
				} else {
					navigate('/');
				}
			}
		} catch (error) {
			if (error.response && error.response.status === 401) {
				setGeneralError(error.response.data.message);
			} else {
				setGeneralError('Login failed');
			}
		}
	};


	return (
		isOpen &&
		(<div className="relative bg-white rounded-lg shadow">
			{!isOtpSent ?
				(!isNewUser ?
					(<>
						<div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
							<h3 className="text-xl font-semibold text-gray-900">Log in or sign up</h3>
							<button type="button" onClick={onClose} className="end-2.5 text-gray-400 bg-transparent hover:bg-primary hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center ">
								<svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" strokeLinecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
								</svg>
								<span className="sr-only">Close modal</span>
							</button>
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
									// innerClass={"text-gray-800"}
									/>
									<p className="text-red-500">{errors.email?.message}</p>
								</div>
								{generalError && <p className="text-red-500">{generalError}</p>}
								<Button
									buttonType="submit"
									size="md"
									variant="filled"
									innerClass="w-[100%] bg-primary"
									innerTextClass="text-white"
									disabled={isSubmitting}
									loading={isSubmitting}
								>
									{isSubmitting ? 'Loading' : 'Continue'}
								</Button>
								<div className='w-full text-center text-md font-medium '>
									OR
								</div>
							</form>
							<GoogleLogin
								onSuccess={handleGoogleLogin}
								onError={() => {
									console.log('Login Failed');
								}}
								text="signup_with"
								shape='pill'
								width="380"
								useOneTap
							// type='icon'
							// theme='filled_blue'
							/>
						</div>
					</>) : (
						<OnboardingModal user={newUser} onClose={onClose} />
					)
				) :
				(
					<>
						<OtpModel email={email} onPrev={() => setIsOtpSent(false)} resendOtp={onSubmit} onClose={onClose} />
					</>
				)}
		</div>)

	)
};

export default LoginPage;
