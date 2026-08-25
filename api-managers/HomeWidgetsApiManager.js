import useAxiosPrivate from '../hooks/useAxiosPrivate';

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const useHomeWidgetsApiManager = () => {
	const axiosPrivate = useAxiosPrivate();
	const HOME_WIDGETS_API = '/api/home-widgets';

	const readHomeWidgets = async () => {
		try {
			const response = await axiosPrivate.get(HOME_WIDGETS_API);
			return response.data.data;
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not load home widgets.'));
		}
	};

	const createHomeWidget = async (investigation) => {
		try {
			const response = await axiosPrivate.post(HOME_WIDGETS_API, { investigation });
			return response.data.data;
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not add home widget.'));
		}
	};

	const deleteHomeWidget = async (investigation) => {
		try {
			const response = await axiosPrivate.delete(
				`${HOME_WIDGETS_API}/${encodeURIComponent(investigation)}`
			);
			return response.data.data;
		} catch (err) {
			throw new Error(getErrorMessage(err, 'Could not remove home widget.'));
		}
	};

	return {
		readHomeWidgets,
		createHomeWidget,
		deleteHomeWidget,
	};
};

export default useHomeWidgetsApiManager;
