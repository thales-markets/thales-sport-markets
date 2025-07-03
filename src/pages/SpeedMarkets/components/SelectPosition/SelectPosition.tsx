import { SpeedPositions } from 'enums/speedMarkets';
import { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { truncToDecimals } from 'thales-utils';
import { SelectedPosition } from 'types/speedMarkets';

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
                <QuoteText>
                    {profitAndSkewPerPosition.profit[SpeedPositions.UP]
                        ? `${truncToDecimals(profitAndSkewPerPosition.profit[SpeedPositions.UP])}x`
                        : '-'}
                </QuoteText>
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
                    {profitAndSkewPerPosition.profit[SpeedPositions.DOWN]
                        ? `${truncToDecimals(profitAndSkewPerPosition.profit[SpeedPositions.DOWN])}x`
                        : '-'}
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
                ? props.isUp
                    ? props.theme.speedMarkets.position.up.selected
                    : props.theme.speedMarkets.position.down.selected
                : props.isUp
                ? props.theme.speedMarkets.position.up.default
                : props.theme.speedMarkets.position.down.default};
    }
    border-radius: 12px;
    cursor: pointer;
    user-select: none;
`;

export default SelectPosition;
