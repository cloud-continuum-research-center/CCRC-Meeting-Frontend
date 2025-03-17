/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import TimerComponent from './TimeLeft';
import QuitBtn from './QuitBtn';
import BoardContainer from '../../common/board/BoardContainer';
import BoardTitle from '../../common/board/BoardTitle';
import { useNavigate } from 'react-router';
import { endMeetingApi } from '../../../api/meetingApi';

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

  const handleExit = () => {
    console.log('Exit button clicked');
    leaveMeeting();
    navigate(-1);
  };

  const handleQuitMeeting = async () => {
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
      
      const meetingData = await endMeetingApi(file, meetingId);
      console.log('Meeting ended successfully:', meetingData);

      leaveMeeting();
      
      navigate(-1);
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
