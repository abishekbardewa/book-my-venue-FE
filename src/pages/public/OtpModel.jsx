import React, { useState } from 'react';
import OtpInput from 'react-otp-input';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { axiosInstance, axiosPrivate } from '../../services/axios.service';
import Button from '../../components/common/Button';
import OnboardingModal from './OnboardingModal';
import { FaAngleLeft } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';
import { handleLoginSuccess } from '../../services/user.service';
import { ROLES } from '../../constants/roles';
import { toast } from 'react-toastify';
const inputStyle = {
	width: '38px',
	height: '38px',
	margin: '0 4px',
	fontSize: '1rem',
	borderRadius: '0.5rem',
	// border: '1px solid #ccc',
	textAlign: 'center',
	color: '#000',
	backgroundColor: '#fff',
	outline: 'none',
	cursor: 'pointer',
	transition: 'all 0.3s ease-in-out',
	fontWeight: '700',
};
const OtpModel = ({ email, onPrev, onClose }) => {
	const { handleSubmit, setValue } = useForm();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [otp, setOtp] = useState('');
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [resend, setResend] = useState(false);
	const navigate = useNavigate();
	const [newUser, setNewUser] = useState({});
	const dispatch = useDispatch();

	const resendOtp = async () => {
		try {
			await axiosInstance.post('/auth/otp', { email });
			setOtp('');
			toast.success('OTP send');
		} catch (error) {
			console.log(error.message);
		}
	};

	const verifyOtp = async () => {
		try {
			const { data } = await axiosPrivate.post('/auth/verify-otp', { email, otp });
			return data;
		} catch (err) {
			setIsSubmitting(false);
			// alert(err.response.data.message);
			toast.error(err.response.data.message);
		}
	};

	const onSubmit = async () => {
		try {
			setIsSubmitting(true);
			const { data } = await verifyOtp();
			console.log(data);
			console.log('Response', data);
			if (data.isNewUser && data.email) {
				console.log('object');
				setNewUser(data);
				setShowOnboarding(true);
				setIsSubmitting(false);
			} else {
				handleLoginSuccess(data);
				//
				if (data.role === ROLES.OWNER) {
					navigate('/owner/property');
				} else {
					closeAll();
				}
				dispatch(setUser(data));
			}
		} catch (err) {
			console.log(err);
			setIsSubmitting(false);
		}
	};

	const closeAll = () => {
		setShowOnboarding(false);
		onClose();
	};

	return (
		<>
			{!showOnboarding ? (
				<>
					<div className="flex items-center p-4 md:p-5 border-b rounded-t ">
						<button type="button" onClick={onPrev} className="bg-transparentrounded-lg text-sm w-8 h-8 ">
							<FaAngleLeft />
						</button>
						<h3 className="text-xl font-semibold text-gray-900">Confirm Your Email</h3>
					</div>
					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center text-black mt-6 gap-10">
						<div className="flex flex-col justify-center items-center">
							Enter the code we've sent via Email to
							<span className="text-primary text-sm block">{email}</span>
						</div>
						<div className="flex items-center justify-center text-black">
							<OtpInput
								shouldAutoFocus
								value={otp}
								onChange={(value) => {
									setOtp(value);
									setValue('otp', value);
								}}
								numInputs={6}
								renderSeparator={<span>-</span>}
								renderInput={(props) => <input {...props} style={inputStyle} />}
							/>
						</div>

						<div className="flex flex-col items-center justify-center text-black">
							<Button
								buttonType="submit"
								size="md"
								variant="filled"
								innerClass="w-[100%] bg-primary"
								innerTextClass="text-white"
								disabled={isSubmitting}
								loading={isSubmitting}
							>
								{isSubmitting ? 'Loading' : 'Verify OTP'}
							</Button>
							<p className="text-sm text-gray-600 mt-6 pb-4">
								No email? Look in spam or{' '}
								<span onClick={resendOtp} className="font-semibold text-primary-500 cursor-pointer hover:underline">
									try sending again.
								</span>
							</p>
						</div>
					</form>
				</>
			) : (
				showOnboarding && <OnboardingModal user={newUser} onClose={closeAll} />
			)}
		</>
	);
};

export default OtpModel;
