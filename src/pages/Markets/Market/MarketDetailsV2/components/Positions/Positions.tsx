import { BetType } from 'constants/tags';
import React, { useState } from 'react';
import { MarketData } from 'types/markets';
import MarketPositions from '../MarketPositions';
// import { useTranslation } from 'react-i18next';
import { Container, Header, Title, ContentContianer, Arrow, ContentRow } from './styled-components';

type PositionsProps = {
    markets: MarketData[];
    betType: BetType;
};

const Positions: React.FC<PositionsProps> = ({ markets, betType }) => {
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
                        return (
                            <ContentRow key={market.address}>
                                <MarketPositions market={market} />
                            </ContentRow>
                        );
                    })}
                </ContentContianer>
            )}
        </Container>
    );
};

export default Positions;
