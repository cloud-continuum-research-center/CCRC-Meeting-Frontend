/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import EtcBoard from './etcBoard/EtcBoard';
import BotBoard from './botBoard/BotBoard';
import { useRecoilState } from 'recoil';
import { userAtom, UserForTeam } from '../../recoil/atoms/userAtom';
import BoardHeader from '../common/board/header/BoardHeader';
import { Meeting as MeetingType } from '../../models/Meeting';
import PersonBoard from './personBoard/PersonBoard';
import { useEffect, useRef, useState } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const STOMP_ENDPOINT = import.meta.env.VITE_STOMP_ENDPOINT;
const WEBRTC_ENDPOINT = import.meta.env.VITE_WEBRTC_ENDPOINT;

type MeetingProps = {
  meeting: MeetingType | null;
  loading: boolean;
  error: string | null;
  teamName: string;
  teamId: number;
};

const MeetingBody = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  padding: 28px 15px 28px 15px; // TRBL
`;

const BlockWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 26px;
  overflow: hidden;
`;

const BlockColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;
  width: 460px;
`;

const Meeting = ({ meeting, teamName, teamId }: MeetingProps) => {
  const [user] = useRecoilState(userAtom);
  const [participants, setParticipants] = useState<UserForTeam[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connections, setConnections] = useState<{
    [key: string]: RTCPeerConnection;
  }>({});
  const stompClientRef = useRef<Client | null>(null);
  const rtcSocketRef = useRef<WebSocket | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  // const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const combinedStreamRef = useRef<MediaStream>(new MediaStream());
  const recordedChunksRef = useRef<Blob[]>([]);
  // 각 원격 참가자별 연결을 저장(다자연결)
  const [remoteConnections, setRemoteConnections] = useState<{ [userId: number]: RTCPeerConnection }>({});
  const [remoteStreams, setRemoteStreams] = useState<{ [userId: number]: MediaStream }>({});



  const handleNonJSONMessage = (message: string) => {
    console.warn('Non-JSON WebSocket message received:', message);
  };

  if (!user || !user.id) {
    throw new Error('User data is not present.');
  }

  useEffect(() => {
    if (!meeting?.meetingId) {
      console.warn('Missing user or meeting details.');
      return;
    }

    if (!stompClientRef.current) {
      console.log('Initializing STOMP client...');
      const stompClient = new Client({
        webSocketFactory: () => new SockJS(STOMP_ENDPOINT),
        debug: (str) => console.log(str),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });

      stompClient.onConnect = () => {
        console.log('Connected to STOMP');

        stompClient.subscribe(
          `/topic/meeting/participants`,
          (message: Message) => {
            try {
              const participantsList = JSON.parse(
                message.body,
              ) as UserForTeam[];
              console.log('Participants received:', participantsList);

              // 중복 제거
              const uniqueParticipants = Array.from(
                new Map(
                  participantsList.map((participant) => [
                    participant.userId,
                    participant,
                  ]),
                ).values(),
              );

              setParticipants(uniqueParticipants);
            } catch (error) {
              console.error('Error parsing participants message:', error);
            }
          },
        );

        stompClient.publish({
          destination: '/api/v1/meeting/enter',
          body: JSON.stringify(user.id),
        });

        initializeWebRTC();
      };

      console.log(
        'MediaRecorder is supported:',
        typeof MediaRecorder !== 'undefined',
      );

      stompClient.onStompError = (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
      };

      stompClient.activate();
      stompClientRef.current = stompClient;
    }

    return () => {
      if (stompClientRef.current) {
        console.log('Deactivating STOMP client...');
        stompClientRef.current.deactivate();
      }
      disconnectWebRTC();
    };
  }, [meeting?.meetingId, teamId, user]);

  const initializeWebRTC = async () => {
    if (!rtcSocketRef.current && meeting?.meetingId && user?.id && teamId) {
      console.log('Initializing WebRTC...');
      const rtcSocket = new WebSocket(WEBRTC_ENDPOINT);
      rtcSocketRef.current = rtcSocket;
  
      rtcSocket.onopen = async () => {
        console.log('WebRTC WebSocket connected');
        rtcSocket.send(
          JSON.stringify({
            userId: user.id,
            meetingId: meeting.meetingId,
            teamId,
          }),
        );
  
        try {
          // ✅ 오디오 + 비디오 스트림 가져오기
          const fullStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
          console.log("내 로컬 스트림:", fullStream);
          console.log("내 로컬 비디오 트랙들:", fullStream.getVideoTracks());
  
          console.log('Full local stream tracks:', fullStream.getTracks());
          setLocalStream(fullStream);
  
          // ✅ WebRTC 연결 생성
          const connection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          });
  
          // ✅ WebRTC에 오디오 + 비디오 추가 (송출)
          fullStream.getTracks().forEach((track) => {
            connection.addTrack(track, fullStream);
          });
  
          connection.onicecandidate = (event) => {
            if (event.candidate) {
              rtcSocket.send(
                JSON.stringify({
                  type: 'ICE_CANDIDATE',
                  userId: user.id,
                  candidate: event.candidate,
                }),
              );
            }
          };
  

          // Offer 생성 및 전송
          const offer = await connection.createOffer();
          await connection.setLocalDescription(offer);
          console.log('Sending OFFER:', connection.localDescription);
          rtcSocket.send(
            JSON.stringify({
              type: 'OFFER',
              userId: user.id,
              meetingId: meeting.meetingId,
              teamId,
              offer, // offer 메시지 전송
            })
          );
         
  
        
          // ✅ 오디오만 녹음용 스트림 생성
          const audioOnlyStream = new MediaStream();
          fullStream.getAudioTracks().forEach((track) => {
            audioOnlyStream.addTrack(track);
          });
  
          console.log('Audio-only stream for recording:', audioOnlyStream.getTracks());
  
          startRecording(audioOnlyStream); // ✅ 오디오만 녹음
        } catch (error) {
          console.error('Error initializing WebRTC:', error);
        }
      };
  
      rtcSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebRTC Signal received:', message);
  
          // 만약 OFFER 메시지이고, 보내는 userId가 현재 사용자와 다르다면
    if (message.type === 'OFFER' && message.userId && message.userId !== user.id) {
      // 이미 해당 userId에 대한 연결이 없으면 새 연결 생성
      if (!remoteConnections[message.userId]) {
        const connection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        connection.onicecandidate = (event) => {
          if (event.candidate) {
            rtcSocket.send(JSON.stringify({
              type: 'ICE_CANDIDATE',
              userId: user.id,
              targetUserId: message.userId,
              candidate: event.candidate,
            }));
          }
        };
        connection.ontrack = (event) => {
          // 1) ontrack 콜백이 불린 시점과 userid확인
          console.log('ontrack event for user', message.userId, event);

          // 2) 스트림이 제대로 있는지 확인
          if (event.streams && event.streams[0]) {
            const remoteStream = event.streams[0];

            // 2-1) 스트림 내 트랙 종류/이름 확인
            remoteStream.getTracks().forEach((trk) => {
              console.log("remote track kind=", trk.kind, "label", trk.label);
            });
            console.log("ontrack에서 받은 스트림:", remoteStream);

  // 여기서 비디오 트랙이 있는지 확인
  console.log("원격 비디오 트랙들:", remoteStream.getVideoTracks());
            console.log(`Received remote stream from user ${message.userId}:`, remoteStream);

            // 3) setRemoteStreams를 통해 state에 반영하기 전후로 확인
            setRemoteStreams((prev) => {
              console.log('[ontrack] prev remoteStreams =', prev);
              console.log('[ontrack] now storing userId:', message.userId);
              
              const updated = {
                ...prev,
                [message.userId]: remoteStream,
              };
              console.log('[ontrack] updated remoteStreams =', updated);
        
              return updated;
          });
        } else {
          console.warn('ontrack event but no valid event.streams[0]', event.streams);
        }
      };
        setRemoteConnections(prev => ({
          ...prev,
          [message.userId]: connection,
        }));

        // 처리: 받은 offer로 remote description 설정하고 answer 생성
        connection.setRemoteDescription(new RTCSessionDescription(message.offer))
          .then(() => connection.createAnswer())
          .then(answer => connection.setLocalDescription(answer))
          .then(() => {
            rtcSocket.send(JSON.stringify({
              type: 'ANSWER',
              userId: user.id,
              targetUserId: message.userId,
              answer: connection.localDescription,
            }));
          })
          .catch(error => {
            console.error('Error handling OFFER from user', message.userId, error);
          });
      }
    } else if (message.type === 'ANSWER' && message.targetUserId === user.id) {
      // Answer 처리
      const conn = remoteConnections[message.userId];
      if (conn) {
        conn.setRemoteDescription(new RTCSessionDescription(message.answer))
          .catch(error => console.error('Error setting remote description:', error));
      }
    } else if (message.type === 'ICE_CANDIDATE' && message.targetUserId === user.id) {
      // ICE Candidate 처리
      const conn = remoteConnections[message.userId];
      if (conn) {
        conn.addIceCandidate(new RTCIceCandidate(message.candidate))
          .catch(error => console.error('Error adding ICE candidate:', error));
      }
    }
  } catch (error) {
    handleNonJSONMessage(event.data);
  }
};
  
      rtcSocket.onclose = () => {
        console.log('WebRTC WebSocket disconnected');
      };
  
      rtcSocket.onerror = (error) => {
        console.error('WebRTC WebSocket error:', error);
      };
    }
  };
  

  const startRecording = (stream: MediaStream) => {
    if (stream.getTracks().length === 0) {
      console.error('The combined stream has no tracks to record.');
      return;
    }

    console.log('Starting MediaRecorder with stream:', stream);

    try {
      const mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn(`${mimeType} is not supported`);
        return;
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);

      // const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        console.log('ondataavailable event:', event);
        if (event.data.size > 0) {
          console.log('Adding chunk to recordedChunksRef:', event.data);
          recordedChunksRef.current.push(event.data);
        } else {
          console.warn('Received an empty chunk.');
        }
      };

      recorder.onstop = () => {
        console.log(
          'Recording stopped. Total chunks in ref:',
          recordedChunksRef.current.length,
        );
      };

      recorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
      };

      setMediaRecorder(recorder);

      recorder.start();
      console.log('MediaRecorder started.');
    } catch (error) {
      console.error('Error initializing MediaRecorder:', error);
    }
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) {
        console.warn('MediaRecorder is not initialized.');
        resolve(new Blob());
        return;
      }

      console.log('Stopping MediaRecorder...');

      // ✅ 여기서 mediaRecorder가 잘 정의되어 있는지 확인
      console.log("🔥 Current MediaRecorder State:", mediaRecorder.state);

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder has stopped.');
        const finalBlob = new Blob(recordedChunksRef.current, {
          type: 'audio/webm',
        });
        console.log('Final recording blob size:', finalBlob.size);
        console.log('🔍 Blob type:', finalBlob.type);
      console.log('🔗 Blob URL:', URL.createObjectURL(finalBlob));
        resolve(finalBlob);

        // ✅ 🔥 기존 MediaRecorder를 다시 시작하는 방식으로 변경
      if (localStream) {
        mediaRecorder.start(); 
        console.log('⏺ Resumed MediaRecorder after stopping.');
      } else {
        console.error("❌ No available stream to restart MediaRecorder.");
      }
      };

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        reject(error);
      };

      mediaRecorder.stop();
    });
  };

  const getRecordingFile = (): Blob => {
    console.log('Retrieving recording...');
    console.log('Recorded chunks in ref:', recordedChunksRef.current);
    if (recordedChunksRef.current.length === 0) {
      console.error('No recorded chunks available.');
      return new Blob();
    }
    const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
    console.log('Recording file created:', blob.size);
    return blob;
  };

  const disconnectWebRTC = () => {
    if (rtcSocketRef.current) {
      console.log('Disconnecting WebRTC...');
      rtcSocketRef.current.close();
      rtcSocketRef.current = null;
    }

    Object.values(connections).forEach((connection) => {
      connection.close();
    });
    setConnections({});
  };

  const leaveMeeting = () => {
    console.log("Leaving meeting...");

    //STOMP를 통해 퇴장 메세지 전송
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/api/v1/meeting/leave",
        body: JSON.stringify({ userId: user.id, meetingId: meeting?.meetingId }),
      });
      console.log("Sent leave message:", { userId: user.id, meetingId: meeting?.meetingId });
    }

    // 참가자 목록에서 본인 제거
    setParticipants((prev) => prev.filter((p) => p.userId !== user.id));
    
    stopRecording();
    disconnectWebRTC();
  };

  useEffect(() => {
    if (!stompClientRef.current) return;

    console.log("Subscribing to leave event...");
    
    const subscription = stompClientRef.current.subscribe(
        `/topic/meeting/leave`,
        (message: Message) => {
            try {
                const { userId } = JSON.parse(message.body);
                console.log(`User ${userId} has left the meeting`);

                // ✅ 참가자 목록에서 퇴장한 유저 제거
                setParticipants((prev) => prev.filter((p) => p.userId !== userId));
            } catch (error) {
                console.error("Error parsing leave message:", error);
            }
        }
    );

    // ✅ 컴포넌트 언마운트 시 구독 해제
    return () => {
        console.log("Unsubscribing from leave event...");
        subscription.unsubscribe();
    };
}, []);


  
  useEffect(() => {
    if (meeting?.meetingId && user?.id && teamId) {
      initializeWebRTC();
    }
  }, [meeting?.meetingId, teamId, user]);

  if (!meeting) {
    return <div></div>;
  }
  
  // remoteStreams 객체 안에 값이 있는지 확인
  console.log("remoteStreams keys:", Object.keys(remoteStreams));


  return (
    <>
      <BoardHeader
        title={teamName}
        description={meeting?.participants?.join(', ') || '-'}
        hasSearchbar={false}
        user={user}
        hasLogo={true}
        teamId={1}
      />
      <MeetingBody>
        <BlockWrapper>
          <PersonBoard participants={participants} localStream={localStream} user={{ id: user?.id ?? 0, nickname: user?.nickname ?? 'Unknown' }}   remoteStreams={remoteStreams}  // 원격 스트림이 필요하다면 추가
 />
          <BlockColumn>
            <EtcBoard
              meetingId={meeting?.meetingId ?? 0}
              leaveMeeting={leaveMeeting}
            />
            <BotBoard
              meetingId={meeting?.meetingId}
              presignedUrl={meeting.presignedUrl}
              getRecordingFile={getRecordingFile}
              stopRecording={stopRecording}
            />
          </BlockColumn>
        </BlockWrapper>
        {/* 1) 디버깅용 Remote Streams 표시 */}
      <div style={{ marginTop: "20px", border: "1px solid red" }}>
        <h3>Debug: Remote Streams</h3>
        {Object.entries(remoteStreams).map(([userid, stream]) => (
          <video
            key={userid}
            autoPlay
            playsInline
            muted
            style={{ width: "200px", border: "2px solid green", marginRight: "8px" }}
            ref={(videoEl) => {
              if (videoEl) {
                videoEl.srcObject = stream;
              }
            }}
          />
        ))}
      </div>
      </MeetingBody>
    </>
  );
};

export default Meeting;

{
  /* <section>
        <h2>Participants</h2>
        <ul>
          {participants.map((participant) => (
            <li key={participant.userId}>
              {participant.nickname}, {participant.role}
            </li>
          ))}
        </ul>
      </section> */
}
