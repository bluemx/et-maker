// src/composables/useAxios.js
import axios from 'axios';


// Create an Axios instance with default headers from environment variables
const axiosInstance = axios.create({
  headers: {
    'AUTHORIZATION': import.meta.env.VITE_PH_K,
    'X-USER-ID': import.meta.env.VITE_PH_I,
  },
});

const useAxiosAudio = () => {
  const request = async (options) => {
    try {
        const response = await axiosInstance({
            ...options,
            headers: {
              ...axiosInstance.defaults.headers.common,
              ...options.headers,
            },
          });
          return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    request,
  };
};

export default useAxiosAudio;