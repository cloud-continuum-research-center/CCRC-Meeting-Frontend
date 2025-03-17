import {
  CreateMeetingRequest,
  Meeting,
  SearchMeetingRequest,
} from '../models/Meeting';
import axiosInstance from './axiosInstance';
import axiosAIInstance from './axiosAIInstance';


export const createMeetingApi = async (
  data: CreateMeetingRequest,
): Promise<Meeting> => {
  const response = await axiosInstance.post('/api/v1/meeting', data);

  if (response.data?.success && response.status === 201) {
    return response.data.data;
  }

  throw new Error('[MeetingApi] Failed to create meeting');
};

export const fetchMeetingDetailApi = async (meetingId: number) => {
  const response = await axiosInstance.get(`/api/v1/meeting`, {
    params: { meetingId },
  });

  if (response.data?.success && response.status === 200) {
    return response.data.data;
  }

  throw new Error('Failed to fetch team details');
};

export const endMeetingApi = async (file: File, meetingId: number) => {
  const aiUrl = import.meta.env.VITE_AI_URL; // 예: http://163.180.117.216:8000
  const endmeetingUrl = `${aiUrl}/api/v1/endmeeting`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("meeting_id", meetingId.toString());
  
  try {
    console.log(`📤 Sending file & meeting ID to endmeeting API at ${endmeetingUrl}...`);
    const responseEndmeeting = await axiosAIInstance.post(endmeetingUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (responseEndmeeting.data?.transcription) {
      console.log("✅ Endmeeting API request successful", responseEndmeeting.data);
    } else {
      console.error("Endmeeting API did not succeed", responseEndmeeting.data);
    }    
    return responseEndmeeting.data;
  } catch (error) {
    console.error("❌ Error in endMeeting:", error);
    throw error;
}
};

export const searchMeetingsApi = async (
  data: SearchMeetingRequest,
): Promise<Meeting[]> => {
  const response = await axiosInstance.post('/api/v1/meeting/search', data);

  if (response.data?.success && response.status === 200) {
    return response.data.data;
  }

  throw new Error('[MeetingApi] Failed to search meetings');
};

// s3 업로드 api
// export const uploadFileToMeetingPresignedUrl = async (
//   presignedUrl: string,
//   file: File,
// ): Promise<void> => {
//   try {
//     const response = await axiosInstance.put(presignedUrl, file, {
//       headers: {
//         'Content-Type': file.type,
//       },
//     });

//     if (response.status !== 200) {
//       throw new Error(`Failed to upload file. Status code: ${response.status}`);
//     }

//     console.log('File uploaded successfully to S3');
//   } catch (error) {
//     console.error('Error uploading file to presigned URL:', error);
//     throw error;
//   }
// };


export const getSummaryBotApi = async (file: File, meetingId: number) => {
  // AI 서버 URL을 환경변수에서 불러옵니다.
  const aiUrl = import.meta.env.VITE_AI_URL; // 예: http://163.180.117.216:8000
  const summaryUrl = `${aiUrl}/api/summary`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("meeting_id", meetingId.toString());

  try {
    console.log(`📤 Sending file & meeting ID to bot summary API at ${summaryUrl}...`);
    const responseSummary = await axiosAIInstance.post(summaryUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (responseSummary.data?.transcription) {
      console.log("✅ Summary API request successful", responseSummary.data);
    } else {
      console.error("Summary API did not succeed", responseSummary.data);
    }    
    return responseSummary.data;
  } catch (error) {
    console.error("❌ Error in getSummaryBotApi:", error);
    throw error;
  }
};

export const getPositiveBotApi = async (file: File, meetingId: number) => {
  // AI 서버 URL을 환경변수에서 불러옵니다.
  const aiUrl = import.meta.env.VITE_AI_URL; // 예: http://163.180.117.216:8000
  const positiveUrl = `${aiUrl}/api/positive`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("meeting_id", meetingId.toString());

  try {
    console.log(`📤 Sending file & meeting ID to bot positive API at ${positiveUrl}...`);
    const responsepositive = await axiosAIInstance.post(positiveUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (responsepositive.data?.transcription) {
      console.log("✅ Positive API request successful", responsepositive.data);
    } else {
      console.error("Positive API did not succeed", responsepositive.data);
    }    
    return responsepositive.data;
  } catch (error) {
    console.error("❌ Error in getPositiveBotApi:", error);
    throw error;
  }
};


export const getNegativeBotApi = async (file: File, meetingId: number) => {
  // AI 서버 URL을 환경변수에서 불러옵니다.
  const aiUrl = import.meta.env.VITE_AI_URL; // 예: http://163.180.117.216:8000
  const negativeUrl = `${aiUrl}/api/negative`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("meeting_id", meetingId.toString());

  try {
    console.log(`📤 Sending file & meeting ID to bot negative API at ${negativeUrl}...`);
    const responseNegative = await axiosAIInstance.post(negativeUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (responseNegative.data?.transcription) {
      console.log("✅ Negative API request successful", responseNegative.data);
    } else {
      console.error("Negative API did not succeed", responseNegative.data);
    }    
    return responseNegative.data;
  } catch (error) {
    console.error("❌ Error in getNegativeBotApi:", error);
    throw error;
  }
};


export const getLoaderBotApi = async (file: File, meetingId: number) => {
  // AI 서버 URL을 환경변수에서 불러옵니다.
  const aiUrl = import.meta.env.VITE_AI_URL; // 예: http://163.180.117.216:8000
  const loaderUrl = `${aiUrl}/api/loader`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("meeting_id", meetingId.toString());

  try {
    console.log(`📤 Sending file & meeting ID to bot loader API at ${loaderUrl}...`);
    const responseLoader = await axiosAIInstance.post(loaderUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const { note_ids, response } = responseLoader.data;


    if (note_ids && response) {
      console.log("✅ Loader API request successful", responseLoader.data);
    } else {
      console.error("Loader API did not succeed", responseLoader.data);
    }    
    return responseLoader.data;
  } catch (error) {
    console.error("❌ Error in getLoaderBotApi:", error);
    throw error;
  }
};






// export const getPositiveBotApi = async (meetingId: number) => {
//   const response = await axiosInstance.get('/api/v1/bot/positive', {
//     params: { meetingId },
//   });
//   if (response.data?.success && response.status === 200) {
//     return response.data.data;
//   }
//   throw new Error('Failed to fetch team details');
// };

// export const getNegativeBotApi = async (meetingId: number) => {
//   const response = await axiosInstance.get('/api/v1/bot/negative', {
//     params: { meetingId },
//   });
//   if (response.data?.success && response.status === 200) {
//     return response.data.data;
//   }
//   throw new Error('Failed to fetch team details');
// };

// export const getLoaderBotApi = async (meetingId: number) => {
//   const response = await axiosInstance.get('/api/v1/bot/loader', {
//     params: { meetingId },
//   });
//   console.log('Loader raw response', response); // 전체 구조
// console.log('Loader data:', response.data);  // data 구조
//   if (response.data?.success && response.status === 200) {
//     return response.data.data;
//   }
//   throw new Error('Failed to fetch team details');
// };
