import Tooltip from 'components/Tooltip';
import { BetTypeNameMap } from 'constants/tags';
import { BetType } from 'enums/markets';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SportMarketInfoV2 } from 'types/markets';
import { isOddValid } from 'utils/markets';
import MarketPositionsV2 from '../MarketPositionsV2';
import { Arrow, Container, ContentContianer, ContentRow, Header, Title } from './styled-components';

type PositionsProps = {
    markets: SportMarketInfoV2[];
    betType: BetType;
    showOdds: boolean;
};

const Positions: React.FC<PositionsProps> = ({ markets, betType, showOdds }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const areOddsValid = markets.some((market) => market.odds.some((odd) => isOddValid(odd)));

    const showContainer = !showOdds || areOddsValid;

    return showContainer ? (
        <Container onClick={() => (!isExpanded ? setIsExpanded(!isExpanded) : '')}>
            <Header>
                <Title isExpanded={isExpanded}>
                    {BetTypeNameMap[betType]}
                    {betType == BetType.PLAYER_PROPS_TOUCHDOWNS && (
                        <Tooltip
                            overlay={
                                <>{t(`markets.market-card.odd-tooltip.player-props.info.${BetTypeNameMap[betType]}`)}</>
                            }
                            iconFontSize={13}
                            marginLeft={3}
                        />
                    )}
                </Title>
            </Header>
            <Arrow
                className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                onClick={() => setIsExpanded(!isExpanded)}
            />
            {isExpanded && (
                <ContentContianer>
                    {markets
                        .sort((marketA: SportMarketInfoV2, marketB: SportMarketInfoV2) => {
                            return sortMarketsByDisabled(marketA, marketB);
                        })
                        .map((market, index) => {
                            return (
                                <div key={index}>
                                    {market.isPlayerPropsMarket && (
                                        <PropsTextContainer>
                                            <PropsText>{`${market.playerProps.playerName}`}</PropsText>
                                        </PropsTextContainer>
                                    )}
                                    <ContentRow>
                                        <MarketPositionsV2 market={market} />
                                    </ContentRow>
                                </div>
                            );
                        })}
                </ContentContianer>
            )}
        </Container>
    ) : (
        <></>
    );
};

const sortMarketsByDisabled = (marketA: SportMarketInfoV2, marketB: SportMarketInfoV2) => {
    const isGameStartedA = marketA.maturityDate < new Date();
    const isGameOpenA = !marketA.isResolved && !marketA.isCanceled && !marketA.isPaused && !isGameStartedA;
    const noOddA = !marketA.odds[0] || marketA.odds[0] == 0;

    const isGameStartedB = marketB.maturityDate < new Date();
    const isGameOpenB = !marketB.isResolved && !marketB.isCanceled && !marketB.isPaused && !isGameStartedB;
    const noOddB = !marketB.odds[0] || marketB.odds[0] == 0;

    const disabledPositionA = noOddA || !isGameOpenA;
    const disabledPositionB = noOddB || !isGameOpenB;
    return disabledPositionB ? -1 : disabledPositionA ? 0 : 1;
};

const PropsTextContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    margin-top: 4px;
`;

const PropsText = styled.span`
    font-size: 12px;
    font-style: normal;
    font-weight: 300;
    text-transform: capitalize;
`;

export default Positions;
