import React, { useState } from 'react';
import { CombinedMarket } from 'types/markets';
import { useTranslation } from 'react-i18next';
import { Container, Header, Title, ContentContianer, Arrow, ContentRow } from '../Positions/styled-components';
import CombinedMarketPositions from '../CombinedMarketPositions';

type CombinedPositionsProps = {
    combinedMarkets: CombinedMarket[];
};

const CombinedPositions: React.FC<CombinedPositionsProps> = ({ combinedMarkets }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const MAX_POSITIONS_PER_ROW = 4;

    const rowsCount =
        combinedMarkets.length % MAX_POSITIONS_PER_ROW == 0
            ? combinedMarkets.length / MAX_POSITIONS_PER_ROW
            : Math.floor(combinedMarkets.length / MAX_POSITIONS_PER_ROW) + 1;
    return (
        <Container>
            <Header>
                <Title isExpanded={isExpanded}>{t(`markets.market-card.bet-type.combined-positions`)}</Title>
            </Header>
            <Arrow
                className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                onClick={() => setIsExpanded(!isExpanded)}
            />
            {isExpanded && (
                <ContentContianer>
                    {Array.from({ length: rowsCount }).map((_item, rowIndex) => {
                        const startIndex = rowIndex == 0 ? rowIndex : rowIndex * MAX_POSITIONS_PER_ROW;
                        const endIndex =
                            startIndex + MAX_POSITIONS_PER_ROW >= combinedMarkets.length
                                ? combinedMarkets.length
                                : startIndex + MAX_POSITIONS_PER_ROW;
                        return (
                            <ContentRow key={`${rowIndex}-row`}>
                                {combinedMarkets.slice(startIndex, endIndex).map((combinedMarket, index) => {
                                    return <CombinedMarketPositions combinedMarket={combinedMarket} key={index} />;
                                })}
                            </ContentRow>
                        );
                    })}
                </ContentContianer>
            )}
        </Container>
    );
};

export default CombinedPositions;
