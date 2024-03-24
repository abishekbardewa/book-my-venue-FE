import { useContext } from 'react';
import { UserContext } from './UserContext';

const useAuth = () => {
	const { user, setUser } = useContext(UserContext);
	return { user, setUser };
};

export default useAuth;
