import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import InputField from '../../components/forms/InputField';
import { ROLES } from '../../constants/roles'; // Import roles if you have defined them elsewhere
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';
import { axiosInstance } from '../../services/axios.service';
import { handleLoginSuccess } from '../../services/user.service';
import { FaHome, FaUser } from 'react-icons/fa';
import Tooltip from '../../components/common/Tooltip';

const OnboardingModal = ({ user, onClose }) => {
	const [generalError, setGeneralError] = useState('');
	const [selectedRole, setSelectedRole] = useState(null);
	const [roleError, setRoleError] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm();

	useEffect(() => {
		if (user) {
			setValue('firstName', user?.firstName);
			setValue('lastName', user?.lastName);
			setValue('email', user?.email);
			setValue('phone', user?.phone);
			setValue('avatar', user.avatar);
		}
	}, [user, setValue]);

	const handleRole = (event, role) => {
		event.stopPropagation();
		setSelectedRole(role);
		setRoleError(false);
	};

	const registerUser = async (userData) => {
		if (!selectedRole) {
			setRoleError(true);
			return;
		}
		setRoleError(false);
		console.log('User', { ...userData, role: selectedRole });
		setGeneralError('');
		try {
			const {
				data: { data },
			} = await axiosInstance.post('/auth', { ...userData, role: selectedRole });
			console.log('newUser', data);
			if (data.status >= 400 && data.status < 500) setGeneralError(data.message);
			handleLoginSuccess(data);
			dispatch(setUser(data));
			if (data.role === ROLES.OWNER) {
				navigate('/owner/property');
				navigate('/owner/property');
			} else {
				onClose();
			}
		} catch (error) {
			if (error.response && error.response.status >= 400 && error.response.status < 500) {
				setGeneralError(error.response.data.message);
			} else {
				setGeneralError(error.message);
			}
		}
	};

	return (
		<>
			<div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
				<h3 className="text-xl font-semibold text-gray-900">Complete Your Profile</h3>
				<button
					type="button"
					onClick={onClose}
					className="text-gray-400 bg-transparent hover:bg-primary hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
				>
					<svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
						<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13" />
					</svg>
					<span className="sr-only">Close modal</span>
				</button>
			</div>
			<form onSubmit={handleSubmit(registerUser)} className="space-y-4 p-4 md:p-5">
				<div className="sm:overflow-hidden">
					<div className="space-y-2 bg-white sm:p-2">
						<div className="flex flex-col gap-4">
							<h2 className=" ">Select Your Profile</h2>
							<div className="flex flex-col  md:flex-row justify-between gap-4">
								<Tooltip content="Users can book available properties.">
									<button
										type="button"
										value={selectedRole}
										className={`flex flex-col justify-center items-center w-full h-20 rounded-md  transition-colors duration-300 ${
											selectedRole === 'CUSTOMER' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
										}`}
										onClick={(e) => handleRole(e, 'CUSTOMER')}
									>
										<FaUser className="text-3xl" />
										<span className="text-sm">User</span>
									</button>
								</Tooltip>
								<Tooltip content="Owners can list their properties for rent.">
									<button
										type="button"
										value={selectedRole}
										className={`flex flex-col justify-center items-center w-full h-20 rounded-md transition-colors duration-300 ${
											selectedRole === 'OWNER' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
										}`}
										onClick={(e) => handleRole(e, 'OWNER')}
									>
										<FaHome className="text-3xl" />
										<span>Owner</span>
									</button>
								</Tooltip>
							</div>
							{roleError && <span className="text-red-500 text-md ">Please select your role</span>}
							<div className="col-span-6 sm:col-span-3">
								<div>
									<InputField
										disabled={true}
										label="Email"
										id="email"
										name="email"
										type="email"
										register={register}
										required="Email is required"
										error={errors?.email}
										innerClass={'text-gray-800'}
									/>
									{errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
								</div>
							</div>
							<div className="flex gap-4">
								<div>
									<InputField label="First Name" id="firstName" name="firstName" register={register} required={true} error={errors?.firstName} />
									{errors.firstName && <span className="text-red-500 text-sm">First name is required</span>}
								</div>
								<div>
									<InputField label="Last Name" id="lastName" name="lastName" register={register} required={true} error={errors?.lastName} />
									{errors.lastName && <span className="text-red-500 text-sm">Last name is required</span>}
								</div>
							</div>
							<div>
								<InputField
									label="Phone"
									id="phone"
									name="phone"
									type="phone"
									register={register}
									required="Phone is required"
									error={errors?.phone}
								/>
								{errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
							</div>
							{generalError && <p className="text-red-500">{generalError}</p>}
							<Button buttonType="submit" size="sm" variant="filled" loading={isSubmitting} disabled={isSubmitting} innerClass="w-full mt-4">
								{isSubmitting ? 'Loading...' : 'Save Changes'}
							</Button>
						</div>
					</div>
				</div>
			</form>
		</>
	);
};

export default OnboardingModal;
