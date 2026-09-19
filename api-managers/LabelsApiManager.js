import useAxiosPrivate from '../hooks/useAxiosPrivate';

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const useLabelsApiManager = () => {
	const axiosPrivate = useAxiosPrivate();
	const LABELS_API = '/api/labels';

	const readLabels = async () => {
		try {
			const response = await axiosPrivate.get(LABELS_API);
			return response.data.data;
		} catch (err) {
			console.log(err);
		}
	};

	const createLabel = async (data) => {
		const { name, color } = data;
		try {
			const response = await axiosPrivate.post(LABELS_API, { name, color });
			return response.data.data;
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not create label.'));
		}
	};

	const updateLabel = async (data) => {
		const { id, name, color } = data;
		try {
			const response = await axiosPrivate.put(`${LABELS_API}/${id}`, { name, color });
			return response.data.data;
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not update label.'));
		}
	};

	const deleteLabel = async (id) => {
		try {
			const response = await axiosPrivate.delete(`${LABELS_API}/${id}`);
			return response.data.data;
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not delete label.'));
		}
	};

	return {
		readLabels,
		createLabel,
		updateLabel,
		deleteLabel,
	};
};

export default useLabelsApiManager;
