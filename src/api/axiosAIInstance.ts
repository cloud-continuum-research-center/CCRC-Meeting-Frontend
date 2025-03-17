import axios from 'axios';


//botApi
const axiosAIInstance = axios.create({
    baseURL: '/AI',
    timeout: 200000,
    headers: {
      'Content-Type': 'application/json',  
    },
  });

  function getFullUrl(config: any) {
    return `${config.baseURL || ''}${config.url}`;
  }

  axiosAIInstance.interceptors.request.use(
    (config) => {
    //   console.log('--- AI Request Details ---');
    //   console.log('URL:', config.url);
    //   console.log('Method:', config.method);
    //   console.log('Params:', config.params);
    //   console.log('Data (Body):', config.data);
    //   console.log('Headers:', config.headers);
      return config;
    },
    (error) => {
      console.error('--- AI Request Error ---');
      console.error(error);
      return Promise.reject(error);
    },
  );
  
  axiosAIInstance.interceptors.response.use(
    (response) => {
      console.log('Full URL (AI):', getFullUrl(response.config));
      console.log('URL:', response.config.url, '\nData:', response.data);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(
          'AI URL:',
          error.response.config?.url,
          '\nData:',
          error.response.data,
        );
      } else {
        console.error('AI Error Message:', error.message);
      }
      return Promise.reject(error);
    },
  );
  
  export default axiosAIInstance;
