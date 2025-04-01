/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { Log } from '../../../models/Log';
import { useFetchLogs } from '../../../hooks/useFetchLogs';
import { fetchLogDetailsApi } from '../../../api/logApi';


type BotResponse = {
  botType: string;
  text: string;
  noteId?: number; // 있을 수도 있고 없을 수도
};

type BotResponsesProps = {
  responses: BotResponse[];
  bots: { [botType: string]: { color: string; imageUrl: string } }; // 봇 정보 (색상, 이미지)
  openLogModal: (noteId: number) => void;
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


function BotResponses({ responses, bots, openLogModal }: BotResponsesProps) {

  return (
    <ResponsesContainer>
      {responses.map((response, index) => {
        const bot = bots[response.botType];
        return (
          <ResponseBubble key={index} color={bot.color}>
            <BotIcon src={bot.imageUrl} alt={response.botType} />
            <div style={{ flex: 1 }}>
              <div>{response.text
                .split(/(?<=[.?!])\s+/) // 마침표, 느낌표, 물음표 뒤에 오는 공백 기준으로 나눔
                .map((line, idx) => (
                  <p key={idx} style={{ marginBottom: '8px' }}>{line}</p>
                ))}</div>

              {/* LoaderBot 전용 버튼 */}
              {response.botType === 'Paper Loader' && (response as any).noteId && (
                <>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#555' }}>
                  회의록을 보려면 클릭하세요!
                </div>
                <button
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    fontSize: '0.9rem',
                    color: 'white',
                    backgroundColor: '#5A9CF5', // 부드러운 연한 파랑
                    border: '1px solid #5A9CF5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0056b3';
                    e.currentTarget.style.borderColor = '#0056b3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#007bff';
                    e.currentTarget.style.borderColor = '#007bff';
                  }}
                  onClick={() => {
                    if (response.noteId !== null) {
                      openLogModal(response.noteId!);
                    }
                  }}
                >
                  📄 회의록 보기
                </button>
              </>
              )}
            </div>
          </ResponseBubble>
        );
      })}
    </ResponsesContainer>
  );
}

export default BotResponses;
