import { BetTypeNameMap } from 'constants/tags';
import { BetType } from 'enums/markets';
import React, { useState } from 'react';
import { CombinedMarket } from 'types/markets';
import CombinedMarketPositions from '../CombinedMarketPositions';
import { Arrow, Container, ContentContianer, ContentRow, Header, Title } from '../Positions/styled-components';

type CombinedPositionsProps = {
    combinedMarkets: CombinedMarket[];
};

const CombinedPositions: React.FC<CombinedPositionsProps> = ({ combinedMarkets }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const MAX_POSITIONS_PER_ROW = 4;

    const rowsCount =
        combinedMarkets.length % MAX_POSITIONS_PER_ROW == 0
            ? combinedMarkets.length / MAX_POSITIONS_PER_ROW
            : Math.floor(combinedMarkets.length / MAX_POSITIONS_PER_ROW) + 1;
    return (
        <Container>
            <Header>
                <Title isExpanded={isExpanded}>{BetTypeNameMap[BetType.COMBINED_POSITIONS]}</Title>
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
