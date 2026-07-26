import useAxiosPrivate from "../hooks/useAxiosPrivate";

const useProfileApiManager = () => {
    const axiosPrivate = useAxiosPrivate();
    const PROFILES_API = '/api/profiles';

    const createProfile = async (data) => {
        const { name, gender, age } = data;
        try {
            const response = await axiosPrivate.post(
                PROFILES_API,
                {
                    name, gender, age
                },
            )
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    const readProfiles = async () => {
        try {
            const response = await axiosPrivate.get(PROFILES_API);
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    const deleteProfile = async (data) => {
        const user = data;
        try {
            const response = await axiosPrivate.delete(`${PROFILES_API}/${user}`)
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    };

    const changeProfile = async (data) => {
        const profile = data;
        try {
            const response = await axiosPrivate.post(`${PROFILES_API}/switch`, { profile });
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    }

    return {
        createProfile, readProfiles, deleteProfile, changeProfile
    }
}

export default useProfileApiManager;
