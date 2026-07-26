import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { add } from "date-fns";

const useAppointmentsApiManager = () => {
    const axiosPrivate = useAxiosPrivate();
    const APPOINTMENTS_API = '/api/appointments';

    const createAppointment = async (data) => {
        const {
            location,
            date,
            time,
            remarks,
        } = data;

        if (!location || !date || !time) {
            return;
        }

        const [hrs, mins] = time.split(':');
        const dateWithTime = add(date, {
            hours: Number(hrs),
            minutes: Number(mins)
        });

        try {
            const response = await axiosPrivate.post(
                APPOINTMENTS_API,
                {
                    location,
                    timestamp: dateWithTime.valueOf(),
                    remarks,
                }
            )
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    const readAppointments = async (filters) => {
        const {
            from,
            to,
            count,
        } = filters;

        let api = APPOINTMENTS_API;

        const searchParams = new URLSearchParams();
        if (from) {
            searchParams.set('from', from);
        }
        if (to) {
            searchParams.set('to', to);
        }
        if (count) {
            searchParams.set('count', count);
        }
        try {
            const response = await axiosPrivate.get(`${api}?${searchParams}`);
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    /** not being used right now */
    const deleteAppointment = async (data) => {
        const appointment = data;
        try {
            const response = await axiosPrivate.delete(`${APPOINTMENTS_API}/${appointment}`)
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    return {
        createAppointment, readAppointments, deleteAppointment
    }
}

export default useAppointmentsApiManager;
