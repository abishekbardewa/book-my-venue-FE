import { axiosInstance, axiosPrivate } from './axios.service';

export async function updateUser(userId, formData) {
	try {
		const { data } = await axiosPrivate.put(`/user/${userId}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || error.response?.statusText);
	}
}
export async function onBoardUser(formData) {
	try {
		const { data } = await axiosInstance.post('/auth', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || error.response?.statusText);
	}
}

export const handleLoginSuccess = (userData) => {
	localStorage.setItem('token', userData.accessToken);
	localStorage.setItem('role', userData.role);
};
