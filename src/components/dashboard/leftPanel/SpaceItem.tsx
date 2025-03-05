/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { AiOutlineCrown, AiOutlineDeploymentUnit } from 'react-icons/ai';
import { Team } from '../../../models/Team';
import { useNavigate } from 'react-router';

type SpaceItemProps = {
  team: Team;
};

const Item = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.medium};
  color: ${(props) => props.theme.colors.textDarkGray};
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.colors.darkWhite};
  }
`;

function SpaceItem({ team }: SpaceItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/${team.teamId}`);
  };

  const Icon = team.role === 'OWNER' ? AiOutlineCrown : AiOutlineDeploymentUnit;

  return (
    <Item onClick={handleClick}>
      <Icon />
      {team.name}
    </Item>
  );
}

export default SpaceItem;
