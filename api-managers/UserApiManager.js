import useAxiosPrivate from '../hooks/useAxiosPrivate';

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const useUserApiManager = () => {
	const axiosPrivate = useAxiosPrivate();
	const USER_API = '/api/user';

	const deleteAccount = async () => {
		try {
			const response = await axiosPrivate.delete(USER_API);
			return response.data;
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not delete account.'));
		}
	};

	return { deleteAccount };
};

export default useUserApiManager;
