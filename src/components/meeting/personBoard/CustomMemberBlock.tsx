/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@emotion/react';

export type CustomMemberBlockProps = {
  imageUrl: string;
  nickname: string;
  authority: string;
  stream?: MediaStream | null; // ✅ 추가: 참가자의 캠 스트림
};

const CustomBlockContainer = styled.div<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  padding: 14px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeadContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: end;
  margin-bottom: 8px;
  gap: 8px;
`;

const Nickname = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.mediumLarge};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.textDarkGray};
`;

const Authority = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.default};
  color: ${(props) => props.theme.colors.textGray};
  margin-bottom: 2px;
`;

const ProfileImage = styled.img`
  width: 50%;
  aspect-ratio: 1;
  border-radius: 100%;
  object-fit: cover;
  margin: 10px;
`;

// ✅ 추가: 캠 화면을 표시하는 video 태그 스타일
const VideoStream = styled.video`
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  border-radius: 100%;
  object-fit: cover;
  margin: 10px;
`;


// const Introduction = styled.div`
//   font-size: ${(props) => props.theme.typography.fontSize.small};
//   color: ${(props) => props.theme.colors.textBlue};
//   bottom: 10px; /* 아래에서 10px */
//   margin-right: auto; /* 왼쪽에서 10px */
//   text-align: left; /* 텍스트 왼쪽 정렬 */
// `;

function CustomMemberBlock({
  imageUrl,
  nickname,
  authority,
  stream, // ✅ 추가: 캠 스트림
}: CustomMemberBlockProps) {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => {
        console.error("❌ Video play error:", error);
      });
    }
  }, [stream]);

  const backgroundColor = useMemo(() => {
    const colors = [
      theme.colors.pastelYellow,
      theme.colors.pastelPink,
      theme.colors.pastelBlue,
      theme.colors.pastelGreen,
      theme.colors.pastelPurple,
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, [theme.colors]);

  return (
    <CustomBlockContainer backgroundColor={backgroundColor}>
      <HeadContainer>
        <Nickname>{nickname}</Nickname>
        <Authority>{authority}</Authority>
      </HeadContainer>
      {stream ? ( // ✅ 캠 화면이 있으면 video 태그로 표시
        <VideoStream ref={videoRef} autoPlay playsInline muted />
      ) : ( // ✅ 캠 화면이 없으면 기존 프로필 이미지 표시
      <ProfileImage src={imageUrl} alt={nickname} />
      )}
    </CustomBlockContainer>
  );
}

export default CustomMemberBlock;
