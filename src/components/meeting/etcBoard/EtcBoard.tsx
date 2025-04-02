/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import TimerComponent from './TimeLeft';
import QuitBtn from './QuitBtn';
import BoardContainer from '../../common/board/BoardContainer';
import BoardTitle from '../../common/board/BoardTitle';
import { useNavigate } from 'react-router';
import { endMeetingApi, endTestApi } from '../../../api/meetingApi';

const FixedHeightContainer = styled(BoardContainer)`
  height: 140px; /* 고정된 높이 */
  flex: none; /* 부모 flex 속성 무시 */
`;

function EtcBoard({
  meetingId,
  leaveMeeting,
  stopRecording,
}: {
  meetingId: number;
  leaveMeeting: () => void;
  stopRecording: () => Promise<Blob>;
}) {
  const meetingDuration = 5400; // 예: 1시간 30분 (초 단위)
  const navigate = useNavigate();

  const handleExit = async() => {
    console.log('Exit button clicked');
    try {

      const recording = await stopRecording();
      console.log('Recording received from stopRecording:', recording);

      if (recording.size === 0) {
        console.error('The recording file is empty. Aborting upload.');

        // 파일이 없어도 퇴장 자체는 할 수 있게 수정
        leaveMeeting();
        navigate(-1);
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // 콜론/점 제거
      const fileName = `meeting_recording_${timestamp}.webm`;

      const file = new File([recording], fileName, {
        type: 'audio/webm',
      });

      console.log('Uploading file size:', file.size);
      // await FileUpload(file, meetingId);
      // await FileUpload(getBaseUrl(presignedUrl), file);
      
      // 일단 퇴장 먼저
      leaveMeeting();
      navigate(-1);

      // ✅ 비동기로 업로드 처리 (백그라운드)
      endTestApi(file, meetingId)
      .then((data) => {
        console.log('Meeting exited successfully:', data);
      })
      .catch((error) => {
        console.error('Failed to upload meeting data:', error);
      });
    } catch (error) {
      console.error('Failed to exit the meeting:', error);
      // 퇴장은 예외가 발생해도 시도
      leaveMeeting();
      navigate(-1);
    }
  };

  const handleQuitMeeting = async () => {
    try {

      const recording = await stopRecording();
      console.log('Recording received from stopRecording:', recording);

      if (recording.size === 0) {
        console.error('The recording file is empty. Aborting upload.');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // 콜론/점 제거
      const fileName = `meeting_recording_${timestamp}.webm`;

      const file = new File([recording], fileName, {
        type: 'audio/webm',
      });

      console.log('Uploading file size:', file.size);
      // await FileUpload(file, meetingId);
      // await FileUpload(getBaseUrl(presignedUrl), file);
      
          // ✅ 퇴장을 먼저 처리
      leaveMeeting();
      navigate(-1);

      // 📦 파일 업로드는 뒤늦게 백그라운드에서 처리
      endMeetingApi(file, meetingId)
        .then((data) => console.log('Meeting ended successfully:', data))
        .catch((err) => console.error('Failed to end meeting:', err));
    } catch (error) {
      console.error('Failed to end the meeting:', error);
    }
  };

  return (
    <FixedHeightContainer>
      <BoardTitle>
        <TimerComponent initialTime={meetingDuration} />
        <QuitBtn onExit={handleExit} onQuitMeeting={handleQuitMeeting} />
      </BoardTitle>
    </FixedHeightContainer>
  );
}

export default EtcBoard;
