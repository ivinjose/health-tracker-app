import useAxiosPrivate from "../hooks/useAxiosPrivate";

const useInvestigationsApiManager = () => {
    const axiosPrivate = useAxiosPrivate();
    const INVESTIGATTIONS_API = '/api/investigations';

    const readInvestigations = async (filters) => {
        const {
            investigation,
        } = filters;

        const searchParams = new URLSearchParams();
        if (investigation) {
            searchParams.set('investigation', investigation);
        }

        try {
            const response = await axiosPrivate.get(`${INVESTIGATTIONS_API}?${searchParams}`);
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    return {
        readInvestigations
    }
}

export default useInvestigationsApiManager;
