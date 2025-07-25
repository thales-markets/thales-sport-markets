import { SpeedPositions } from 'enums/speedMarkets';
import { Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SelectedPosition } from 'types/speedMarkets';
import { formatMarketOdds } from 'utils/markets';

type SelectPositionProps = {
    selectedPosition: SelectedPosition;
    setSelectedPosition: Dispatch<SetStateAction<SelectedPosition>>;
    profitAndSkewPerPosition: {
        profit: { [SpeedPositions.UP]: number; [SpeedPositions.DOWN]: number };
        skew: { [SpeedPositions.UP]: number; [SpeedPositions.DOWN]: number };
    };
};

const SelectPosition: React.FC<SelectPositionProps> = ({
    selectedPosition,
    setSelectedPosition,
    profitAndSkewPerPosition,
}) => {
    const selectedOddsType = useSelector(getOddsType);

    const impliedOddsUp = profitAndSkewPerPosition.profit[SpeedPositions.UP]
        ? 1 / profitAndSkewPerPosition.profit[SpeedPositions.UP]
        : 0;
    const impliedOddsDown = profitAndSkewPerPosition.profit[SpeedPositions.DOWN]
        ? 1 / profitAndSkewPerPosition.profit[SpeedPositions.DOWN]
        : 0;

    return (
        <Container>
            <PositionButton
                isUp
                isSelected={selectedPosition === SpeedPositions.UP}
                onClick={() =>
                    setSelectedPosition(selectedPosition === SpeedPositions.UP ? undefined : SpeedPositions.UP)
                }
            >
                <Position>
                    <Text>{SpeedPositions.UP}</Text>
                    <PositionIcon isUp className="speedmarkets-icon speedmarkets-icon--arrow" />
                </Position>
                <QuoteText>{impliedOddsUp ? `${formatMarketOdds(selectedOddsType, impliedOddsUp)}x` : '-'}</QuoteText>
            </PositionButton>
            <PositionButton
                isSelected={selectedPosition === SpeedPositions.DOWN}
                onClick={() =>
                    setSelectedPosition(selectedPosition === SpeedPositions.DOWN ? undefined : SpeedPositions.DOWN)
                }
            >
                <Position>
                    <Text>{SpeedPositions.DOWN}</Text>
                    <PositionIcon className="speedmarkets-icon speedmarkets-icon--arrow" />
                </Position>
                <QuoteText>
                    {impliedOddsDown ? `${formatMarketOdds(selectedOddsType, impliedOddsDown)}x` : '-'}
                </QuoteText>
            </PositionButton>
        </Container>
    );
};

const Container = styled(FlexDivRow)`
    min-height: 54px;
    gap: 8px;
`;

const Text = styled.span`
    text-align: center;
    font-size: 20px;
    font-weight: 700;
`;

const QuoteText = styled(Text)`
    font-size: 14px;
    font-weight: 800;
    line-height: 110%;
`;

const Position = styled(FlexDivRow)`
    gap: 5px;
`;

const PositionIcon = styled.i<{ isUp?: boolean }>`
    font-size: 14px;
    line-height: 20px;
    rotate: ${(props) => (props.isUp ? '-90deg' : '90deg')};
`;

const PositionButton = styled(FlexDivColumnCentered)<{ isSelected: boolean; isUp?: boolean }>`
    align-items: center;
    background: ${(props) =>
        props.isSelected
            ? props.theme.speedMarkets.button.background.active
            : props.theme.speedMarkets.button.background.primary};
    ${Text} {
        color: ${(props) =>
            props.isSelected
                ? props.theme.speedMarkets.button.textColor.active
                : props.theme.speedMarkets.button.textColor.primary};
    }
    ${PositionIcon} {
        color: ${(props) =>
            props.isSelected
                ? props.theme.speedMarkets.position.selected
                : props.isUp
                ? props.theme.speedMarkets.position.up
                : props.theme.speedMarkets.position.down};
    }
    border-radius: 12px;
    cursor: pointer;
    user-select: none;
`;

export default SelectPosition;
