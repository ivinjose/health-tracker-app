import useAxiosPrivate from "../hooks/useAxiosPrivate";

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const useInvestigationsApiManager = () => {
    const axiosPrivate = useAxiosPrivate();
    const INVESTIGATIONS_API = '/api/investigations';

    const readInvestigations = async (filters = {}) => {
        const {
            investigation,
        } = filters;

        const searchParams = new URLSearchParams();
        if (investigation) {
            searchParams.set('investigation', investigation);
        }

        try {
            const response = await axiosPrivate.get(`${INVESTIGATIONS_API}?${searchParams}`);
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    const createInvestigation = async (data) => {
        const { label, value, unit } = data;
        try {
            const response = await axiosPrivate.post(
                INVESTIGATIONS_API,
                { label, value, unit: unit || '' },
            );
            return response.data.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Could not create investigation.'));
        }
    };

    const updateInvestigation = async (data) => {
        const { id, label, unit } = data;
        try {
            const response = await axiosPrivate.put(
                `${INVESTIGATIONS_API}/${id}`,
                { label, unit: unit || '' },
            );
            return response.data.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Could not update investigation.'));
        }
    };

    const deleteInvestigation = async (id) => {
        try {
            const response = await axiosPrivate.delete(`${INVESTIGATIONS_API}/${id}`);
            return response.data.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Could not delete investigation.'));
        }
    };

    return {
        readInvestigations,
        createInvestigation,
        updateInvestigation,
        deleteInvestigation,
    }
}

export default useInvestigationsApiManager;
