import useAxiosPrivate from "../hooks/useAxiosPrivate";

const useReportsApiManager = () => {
    const axiosPrivate = useAxiosPrivate();
    const REPORTS_API = '/api/reports';

    const createReport = async (data) => {
        const {
            investigation,
            value,
            date,
            remarks,
            appointment,
            report
        } = data;

        const parsedNumber = Number(value);

        if (!investigation || !parsedNumber || !date) {
            return;
        }

        try {
            const response = await axiosPrivate.post(
                REPORTS_API,
                {
                    investigation,
                    value: parsedNumber,
                    timestamp: date.valueOf(),
                    appointment: appointment || undefined,
                    remarks,
                    report
                },
            )
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    const readReports = async (filters) => {
        const {
            investigation,
            count,
            from,
            to,
            order
        } = filters;

        const searchParams = new URLSearchParams();
        if (investigation) {
            searchParams.set('investigation', investigation);
        }
        if (count) {
            searchParams.set('count', count);
        }
        if (from) {
            searchParams.set('from', from);
        }
        if (to) {
            searchParams.set('to', to);
        }
        if (order) {
            searchParams.set('order', order);
        }

        try {
            const response = await axiosPrivate.get(`${REPORTS_API}?${searchParams}`);
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    /** not being used right now */
    const deleteReport = async (data) => {
        const report = data;
        try {
            const response = await axiosPrivate.delete(`${REPORTS_API}/${report}`)
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    const compareReports = async (filters) => {
        const {
            investigation1,
            investigation2,
            from,
            to,
        } = filters;

        let api = `${REPORTS_API}/compare`;

        const searchParams = new URLSearchParams();
        searchParams.set('investigations', [investigation1, investigation2].join(','));
        if (from) {
            searchParams.set('from', from);
        }
        if (to) {
            searchParams.set('to', to);
        }
        try {
            const response = await axiosPrivate.get(`${api}?${searchParams}`);
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    return {
        createReport, readReports, deleteReport, compareReports
    }
}

export default useReportsApiManager;
