import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import BotList from './BotList';
import BotResponses from './BotResponses';
import Divider from '../../common/Divider';
import { theme } from '../../../styles/theme';
import {
  getNegativeBotApi,
  getPositiveBotApi,
  getSummaryBotApi,
  getLoaderBotApi,
  getMoyaBotApi,
  // uploadFileToMeetingPresignedUrl, // 필요없어짐
  // uploadFileToBotApi
} from '../../../api/meetingApi';
import { getBaseUrl } from '../../../utils/meetingUtils'; // 필요없어짐
import { Log } from '../../../models/Log';
import { useFetchLogs } from '../../../hooks/useFetchLogs';
import { fetchLogDetailByLoadersApi } from '../../../api/logApi';
import LogModal from '../../common/logBoard/LogModal';


type BotResponse = {
  botType: string;
  text: string;
  noteId?: number; // 있을 수도 있고 없을 수도
};

const BoardContainer = styled.div`
  display: flex;
  flex: 4;
  flex-direction: column;
  padding: 20px;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 8px;
  max-height: 85%;
`;

const BoardTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px; /* 아이템 간 간격 */
`;

const BotContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* ✅ 줄바꿈 허용 */
  justify-content: center; /* 가로로 균등 분배 */
  align-items: center; /* 세로 중앙 정렬 */
  gap: 12px; /* 각 봇 간격 */
  margin-bottom: 0;
`;

const bots = [
  {
    name: '팔자핑',
    imageUrl: '/assets/images/paljaping2.webp',
    botType: 'Positive Feedback',
    color: '#90D4AB', 
  },
  {
    name: '타입핑',
    imageUrl: '/assets/images/typeping.webp',
    botType: 'Attendance Checker',
    color: '#AEE4FF	', // 하늘색
  },
  {
    name: '모야핑',
    imageUrl: '/assets/images/moyaping.webp',
    botType: 'Communitacion',
    color: '#F28B82			', // 핑크색
  },
  {
    name: '코어핑',
    imageUrl: '/assets/images/coreping.webp',
    botType: 'Summary',
    color: '#FDDCE2	', // 핑크색
  },
  {
    name: '유노핑',
    imageUrl: '/assets/images/youKnowping.webp',
    botType: 'Paper Loader',
    color: '#FFFF91', // 노란색
  },
];

// const responsesMap: { [botType: string]: string } = {
//   'Positive Feedback':
//     'Stay hydrated during your meeting!Stay hydrated during your meeting!Stay hydrated during your meeting!Stay hydrated during your meeting!',
//   'Attendance Checker':
//     'll keep track of your tasks!ll keep track of your tasks!ll keep track of your tasks!ll keep track of your tasks!ll keep track of your tasks!',
//   Summary:
//     'Let’s boost the productivity!testtesttesttesttestLet’s boost the productivity!testtesttesttesttestLet’s boost the productivity!testtesttesttesttest',
// };

type BotBoardProps = {
  meetingId: number;
  // presignedUrl: string | undefined | null;
  getRecordingFile: (chunks: Blob[]) => Blob;
  stopRecording: () => Promise<Blob>;
};

function BotBoard({ meetingId, stopRecording }: BotBoardProps) {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [responses, setResponses] = useState<
    { botType: string; text: string; noteId?: number  }[]
  >([]);
  // 모달 열림/닫힘 상태와 선택된 회의록 데이터를 위한 상태
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

    // 실제 회의록 세부 정보를 가져오는 API 호출 (예시)
    const openLogModal = async (noteId: number | null) => {
      if (noteId === null) {
        alert('noteId가 없습니다.');
        return;
      }
      try {
        const logDetails = await fetchLogDetailByLoadersApi(noteId);
        setSelectedLog(logDetails);
        setModalOpen(true);
      } catch (err) {
        console.error('Failed to fetch log details', err);
        alert('Failed to fetch log details');
      }
    };

  // useEffect(() => {
  //   if (!presignedUrl) {
  //     console.warn('Missing presignedUrl.');
  //     return;
  //   }
  // });

  // s3 업로드
  // const FileUpload = async (presignedUrl: string, file: File) => {
  //   try {
  //     console.log('Uploading file to S3...');
  //     await uploadFileToMeetingPresignedUrl(presignedUrl, file);
  //   } catch (error) {
  //     console.error('Failed to upload file:', error);
  //   }
  // };

    // 백엔드에 업로드
  // const FileUpload = async (file: File, meetingId: number) => {
  //   try {
  //     console.log('Uploading file to backend...');
  //     await uploadFileToBotApi(file, meetingId);
  //   } catch (error) {
  //     console.error('Failed to upload file:', error);
  //   }
  // };

  const handleSelectBot = async (botType: string) => {
    if (!meetingId) {
      console.error('Meeting ID is not available');
      return;
    }

    try {
      const recording = await stopRecording();
      console.log('Recording received from stopRecording:', recording);

      if (recording.size === 0) {
        console.error('The recording file is empty. Aborting upload.');
        return;
      }

      const file = new File([recording], 'meeting_recording.webm', {
        type: 'audio/webm',
      });

      console.log('Uploading file size:', file.size);
      // await FileUpload(file, meetingId);
      // await FileUpload(getBaseUrl(presignedUrl), file);

      // 공통 봇 핸들러
      const handleGenericBotResponse = (botType: string, responseText: any) => {
        const newResponse = {
          botType,
          text: responseText.llm_response ?? '(llm_response가 없습니다)',
        };
        setResponses((prev) => [...prev, newResponse]);
        setSelectedBot(botType);
      };

      // 로더 봇 핸들러
      const handleLoaderBotResponse = (responseText: any) => {
        const newResponse = {
          botType: 'Paper Loader',
          text: responseText.response ?? '(응답 없음)',
          noteId: responseText.note_ids,
        };
        setResponses((prev) => [...prev, newResponse]);
        setSelectedBot('Paper Loader');
      };
      
      let responseText;
      if (botType === 'Positive Feedback') { // saju
        responseText = await getPositiveBotApi(file, meetingId);
        handleGenericBotResponse(botType, responseText);

      } else if (botType === 'Attendance Checker') { // mbti
        responseText = await getNegativeBotApi(file, meetingId);
        handleGenericBotResponse(botType, responseText);

      } else if (botType === 'Summary') { 
        responseText = await getSummaryBotApi(file, meetingId);
        handleGenericBotResponse(botType, responseText);

      } else if (botType === 'Communitacion') { 
        responseText = await getMoyaBotApi(file, meetingId);
        handleGenericBotResponse(botType, responseText);

      } else if (botType === 'Paper Loader') {
        responseText = await getLoaderBotApi(file, meetingId);
        handleLoaderBotResponse(responseText);
        console.log('Loader Bot API response:', responseText);
      }

      // const newResponse = { botType, text: responseText.llm_response ?? "(llm_response가 없습니다)", };
      // setResponses((prev) => [...prev, newResponse]);
      // setSelectedBot(botType);



      


    } catch (error) {
      console.error('Error handling bot selection:', error);
    }
  };

  // await FileUpload(getBaseUrl(presignedUrl, 'DUMMY_FILE'));
  // const response = await getSummaryBotApi(meetingId); // this is the actual 'new response'
  // const newResponse = { botType, text: responsesMap[botType] }; // this is dummy data
  // setResponses((prev) => [...prev, newResponse]);
  // setSelectedBot(botType);
  // };



  const botColorsAndImages = bots.reduce(
    (acc, bot) => {
      acc[bot.botType] = { color: bot.color, imageUrl: bot.imageUrl };
      return acc;
    },
    {} as { [botType: string]: { color: string; imageUrl: string } },
  );

  return (
    <BoardContainer>
      <BoardTitleContainer>
        <BotContainer>
          {bots.map((bot) => (
            <BotList
              key={bot.botType}
              imageUrl={bot.imageUrl}
              botType={bot.botType}
              color={bot.color}
              selectedBot={selectedBot}
              onSelectBot={handleSelectBot}
              botName={bot.name}
            />
          ))}
        </BotContainer>
        <Divider color={theme.colors.lineGray} />
        <BotResponses responses={responses} bots={botColorsAndImages} openLogModal={openLogModal} />
      </BoardTitleContainer>
      {isModalOpen && selectedLog && (
        <LogModal log={selectedLog} onClose={() => setModalOpen(false)} />
      )}
    </BoardContainer>
  );
}

export default BotBoard;
