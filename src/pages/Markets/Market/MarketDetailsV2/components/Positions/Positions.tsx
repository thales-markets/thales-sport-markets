import { Position, Side } from 'constants/options';
import { BetType } from 'constants/tags';
import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { AvailablePerSide, MarketData } from 'types/markets';
import { getVisibilityOfDrawOptionByTagId } from 'utils/markets';
import PositionDetails from '../PositionDetails';
import { Container, Header, Title, ContentContianer, Arrow, ContentRow } from './styled-components';

type PositionsProps = {
    markets: MarketData[];
    betType: BetType;
    selectedSide: Side;
    availablePerSide: AvailablePerSide;
};

const Positions: React.FC<PositionsProps> = ({ markets, betType, selectedSide, availablePerSide }) => {
    // const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    return (
        <Container>
            <Header>
                <Title isExpanded={isExpanded}>
                    {betType === BetType.WINNER ? 'WINNER' : betType === BetType.SPREAD ? 'HANDICAP' : 'TOTAL'}
                </Title>
            </Header>
            <Arrow
                className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                onClick={() => setIsExpanded(!isExpanded)}
            />
            {isExpanded && (
                <ContentContianer>
                    {markets.map((market) => {
                        const showDrawOdds = getVisibilityOfDrawOptionByTagId(market.tags);
                        return (
                            <ContentRow key={market.address}>
                                <PositionDetails
                                    market={market}
                                    selectedSide={selectedSide}
                                    availablePerSide={availablePerSide}
                                    position={Position.HOME}
                                />
                                {showDrawOdds && (
                                    <PositionDetails
                                        market={market}
                                        selectedSide={selectedSide}
                                        availablePerSide={availablePerSide}
                                        position={Position.DRAW}
                                    />
                                )}
                                <PositionDetails
                                    market={market}
                                    selectedSide={selectedSide}
                                    availablePerSide={availablePerSide}
                                    position={Position.AWAY}
                                />
                            </ContentRow>
                        );
                    })}
                </ContentContianer>
            )}
        </Container>
    );
};

export default Positions;
