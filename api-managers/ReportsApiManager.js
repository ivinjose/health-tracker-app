import { buildCreateReportRequest } from "../lib/reportUpload";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const useReportsApiManager = () => {
    const axiosPrivate = useAxiosPrivate();
    const REPORTS_API = '/api/reports';

    const createReport = async (data) => {
        const { body, config } = buildCreateReportRequest(data);

        try {
            const response = await axiosPrivate.post(REPORTS_API, body, config);
            return response.data.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Could not create report.'));
        }
    };

    const updateReport = async (data) => {
        const { id, investigation, value, date, remarks } = data;
        const parsedNumber = Number(value);

        if (!id || !investigation || !parsedNumber || !date) {
            throw new Error('Could not update report.');
        }

        try {
            const response = await axiosPrivate.put(
                `${REPORTS_API}/${id}`,
                {
                    investigation,
                    value: parsedNumber,
                    timestamp: date.valueOf(),
                    remarks,
                },
            );
            return response.data.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Could not update report.'));
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

    const createReports = async (rows) => {
        const results = await Promise.allSettled(rows.map((row) => createReport(row)));
        return results.map((result, index) => ({
            row: rows[index],
            status: result.status,
            value: result.status === 'fulfilled' ? result.value : undefined,
            error:
                result.status === 'rejected'
                    ? result.reason instanceof Error
                        ? result.reason
                        : new Error(String(result.reason))
                    : undefined,
        }));
    };

    const deleteReport = async (data) => {
        const report = data;
        try {
            const response = await axiosPrivate.delete(`${REPORTS_API}/${report}`)
            return response.data.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Could not delete report.'));
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
        createReport, createReports, updateReport, readReports, deleteReport, compareReports
    }
}

export default useReportsApiManager;
