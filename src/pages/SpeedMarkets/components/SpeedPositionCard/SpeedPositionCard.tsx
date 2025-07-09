import styled from 'styled-components';
import { FlexDivColumnEnd, FlexDivColumnStart, FlexDivRow } from 'styles/common';
import { UserPosition } from 'types/speedMarkets';

type SpeedPositionCardProps = {
    position: UserPosition;
};

const SpeedPositionCard: React.FC<SpeedPositionCardProps> = ({ position }) => {
    // const isMatured = position.maturityDate < Date.now();

    return (
        <Container>
            <FlexDivColumnStart>
                <div>{position.asset}</div>
                <span>{`Entry: ${position.strikePrice}`}</span>
                <span>{position.createdAt}</span>
            </FlexDivColumnStart>
            <FlexDivColumnEnd>
                <span></span>
                <span></span>
                <span></span>
            </FlexDivColumnEnd>
        </Container>
    );
};

const Container = styled(FlexDivRow)`
    height: 95px;
    border-radius: 16px;
    background: ${(props) => props.theme.speedMarkets.position.card.background.primary};
    padding: 13px 22px;
`;

export default SpeedPositionCard;
