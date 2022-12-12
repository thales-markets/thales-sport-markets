import { Position, Side } from 'constants/options';
import { MAIN_COLORS } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AvailablePerSide, MarketData } from 'types/markets';
import { getVisibilityOfDrawOptionByTagId } from 'utils/markets';
import PositionDetails from '../PositionDetails';
import { Container, Header, Status, Title, ContentContianer } from './styled-components';

type PositionsProps = {
    market: MarketData;
    selectedSide: Side;
    availablePerSide: AvailablePerSide;
    selectedPosition: Position;
    setSelectedPosition: (index: number) => void;
};

const Positions: React.FC<PositionsProps> = ({
    market,
    selectedSide,
    availablePerSide,
    selectedPosition,
    setSelectedPosition,
}) => {
    const { t } = useTranslation();

    const showDrawOdds = getVisibilityOfDrawOptionByTagId(market.tags);

    const isGameCancelled = market.cancelled || (!market.gameStarted && market.resolved);
    const isGameResolved = market.gameStarted && market.resolved;
    const isPendingResolution = market.gameStarted && !market.resolved;
    const isGamePaused = market.paused && !isGameResolved && !isGameCancelled;
    const showPositions = !market.resolved && !market.cancelled && !market.gameStarted && !market.paused;

    return (
        <>
            {showPositions ? (
                <Container>
                    <Header>
                        <Title>WINNER</Title>
                    </Header>
                    <ContentContianer>
                        <PositionDetails
                            market={market}
                            selectedSide={selectedSide}
                            availablePerSide={availablePerSide}
                            selectedPosition={selectedPosition}
                            setSelectedPosition={setSelectedPosition}
                            position={Position.HOME}
                        />
                        {showDrawOdds && (
                            <PositionDetails
                                market={market}
                                selectedSide={selectedSide}
                                availablePerSide={availablePerSide}
                                selectedPosition={selectedPosition}
                                setSelectedPosition={setSelectedPosition}
                                position={Position.DRAW}
                            />
                        )}
                        <PositionDetails
                            market={market}
                            selectedSide={selectedSide}
                            availablePerSide={availablePerSide}
                            selectedPosition={selectedPosition}
                            setSelectedPosition={setSelectedPosition}
                            position={Position.AWAY}
                        />
                    </ContentContianer>
                </Container>
            ) : (
                <Status backgroundColor={isGameCancelled ? MAIN_COLORS.BACKGROUNDS.RED : MAIN_COLORS.LIGHT_GRAY}>
                    {isPendingResolution
                        ? t('markets.market-card.pending-resolution')
                        : isGameCancelled
                        ? t('markets.market-card.canceled')
                        : isGamePaused
                        ? t('markets.market-card.paused')
                        : `${t('markets.market-card.result')}: ${market.homeScore} - ${market.awayScore}`}
                </Status>
            )}
        </>
    );
};

export default Positions;
