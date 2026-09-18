import { buildCreateReportRequest, buildCreateReportsRequest, buildUpdateReportRequest } from "../lib/reportUpload";
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
        const { body, config } = buildUpdateReportRequest(data);

        try {
            const response = await axiosPrivate.put(
                `${REPORTS_API}/${data.id}`,
                body,
                config,
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

    const createReports = async (rows, report) => {
        const { body, config } = buildCreateReportsRequest(rows, report);

        try {
            const response = await axiosPrivate.post(`${REPORTS_API}/bulk`, body, config);
            return response.data.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Could not create reports.'));
        }
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

    const downloadReport = async (filename) => {
        if (!filename) {
            throw new Error('Could not download report.');
        }

        try {
            const response = await axiosPrivate.get(`${REPORTS_API}/download`, {
                params: { filename },
                responseType: 'arraybuffer',
            });
            return response.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Could not download report.'));
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
        createReport, createReports, updateReport, readReports, deleteReport, downloadReport, compareReports
    }
}

export default useReportsApiManager;
