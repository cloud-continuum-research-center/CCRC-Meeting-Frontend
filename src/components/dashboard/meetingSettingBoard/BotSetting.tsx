import BotBlock from './BotBlock';
import { Spacer } from '../../common/Spacer';
import paljaPingImg from '/assets/images/paljaping2.webp';
import typePingImg from '/assets/images/typeping.webp';
import moyaPingImg from '/assets/images/moyaping.webp';
import corePingImg from '/assets/images/coreping.webp';
import youKnowImg from '/assets/images/youKnowping.webp';

export type BotType =
  | 'Positive Feedback'
  | 'Attendance Checker'
  | 'Communication'
  | 'Summary'
  | 'Paper Loader';

  // 디스플레이 매핑객체 추가
  const botTypeToDisplayName: Record<BotType, string> = {
    'Positive Feedback': '사주핑',
    'Attendance Checker': '타입핑',
    'Communication': '모야핑',
    'Summary': '코어핑',
    'Paper Loader': '유노핑',
  };

  // 디스크립션 매핑
  const botTypeToDescription: Record<BotType, string> = {
    'Positive Feedback': '생년월일로 사주를 알려드려요!✨',
    'Attendance Checker': '몇가지 질문으로 MBTI를 맞춰볼게요! 🧠',
    'Communication': '궁금한게 있으면 물어보세요! 💬',
    'Summary': '대화내용을 요약해드려요! 📝',
    'Paper Loader': '무슨 대화를 나눴는지 궁금하세요?📄',
  };

type BotSettingsProps = {
  botStates: Record<BotType, boolean>;
  onToggle: (botType: BotType) => void;
};

const botImages: Record<BotType, string> = {
  'Positive Feedback': paljaPingImg, //팔자핑
  'Attendance Checker': typePingImg, //타입핑
  'Communication': moyaPingImg, //모야핑
  'Summary': corePingImg, //
  'Paper Loader': youKnowImg,
};

export const BotSettings = ({ botStates, onToggle }: BotSettingsProps) => {
  return (
    <>
      {Object.keys(botStates).map((botType) => (
        <BotBlock
          key={botType}
          isActive={botStates[botType as BotType]}
          imageUrl={botImages[botType as BotType]}
          botType={botType as BotType}
          description={botTypeToDescription[botType as BotType]} // 디스크립션
          displayName={botTypeToDisplayName[botType as BotType]} // 디스플레이
          onToggle={() => onToggle(botType as BotType)}
        />
      ))}
      <Spacer height={36} />
    </>
  );
};

export default BotSettings;
