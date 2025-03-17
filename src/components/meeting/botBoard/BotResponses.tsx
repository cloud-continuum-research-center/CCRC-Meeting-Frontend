import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';


type BotResponsesProps = {
  responses: { botType: string; text: string }[];
  bots: { [botType: string]: { color: string; imageUrl: string } }; // 봇 정보 (색상, 이미지)
  // onOpenModal: (noteId: number) => void;
};

const ResponsesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;

  /* 스크롤 가능 설정 */
  // max-height: 100%;
  max-height: 460px;
  overflow-y: scroll;
  padding-right: 10px;

  /* 스크롤바 스타일 (웹 브라우저마다 다를 수 있음) */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
`;

const ResponseBubble = styled.div<{ color: string }>`
  max-width: 100%;
  border: 1px solid ${({ color }) => color};
  padding: 12px 15px;
  border-radius: 12px;
  display: flex;
  // font-size: ${(props) => props.theme.typography.fontSize.medium};
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.textDarkGray};
  align-items: center;
  gap: 16px;
  line-height: 1.2;
`;

const BotIcon = styled.img`
  max-width: 30px;
  max-height: 30px;
  background-position: center;
`;

// const openLogModal = async (noteId: number) => {
//   try {
//     const logDetails = await fetchLogDetailsApi(noteId);
//     setSelectedLog(logDetails);
//     setModalOpen(true);
//   } catch (err) {
//     console.error('Failed to fetch log details', err);
//     alert('Failed to fetch log details');
//   }
// };


function BotResponses({ responses, bots }: BotResponsesProps) {

  return (
    <ResponsesContainer>
      {responses.map((response, index) => {
        const bot = bots[response.botType];
        return (
          <ResponseBubble key={index} color={bot.color}>
            <BotIcon src={bot.imageUrl} alt={response.botType} />
            <div style={{ flex: 1 }}>
              <div>{response.text}</div>

              {/* LoaderBot 전용 버튼 */}
              {response.botType === 'Paper Loader' && (response as any).noteId && (
                <button
                  style={{
                    marginTop: '8px',
                    fontSize: '0.9rem',
                    color: '#007bff',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  // onClick={() => openLogModal((response as any).noteId)} //대기
                >
                  📄 회의록 보기
                </button>
              )}
            </div>
          </ResponseBubble>
        );
      })}
    </ResponsesContainer>
  );
}

export default BotResponses;
