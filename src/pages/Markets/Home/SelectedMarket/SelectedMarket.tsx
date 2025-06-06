import UsElectionHeader from 'assets/images/us-election.svg?react';
import MatchLogosV2 from 'components/MatchLogosV2';
import SimpleLoader from 'components/SimpleLoader';
import { SportFilter } from 'enums/markets';
import { SelectedMarketOpenedTable } from 'enums/ui';
import { t } from 'i18next';
import { isEqual } from 'lodash';
import { League } from 'overtime-utils';
import GameStats from 'pages/Markets/Market/MarketDetailsV2/components/GameStats';
import { Message } from 'pages/Markets/Market/MarketDetailsV2/components/PositionsV2/styled-components';
import React, { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getSelectedMarket, getSportFilter, setSelectedMarket } from 'redux/modules/market';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarket } from 'types/markets';
import { getMatchLabel } from 'utils/marketsV2';
import TicketTransactions from '../../Market/MarketDetailsV2/components/TicketTransactions';
import Header from '../Header';
import SelectedMarketDetails from '../SelectedMarketDetails';

const SelectedMarket: React.FC<{ market: SportMarket | undefined }> = memo(
    ({ market }) => {
        const dispatch = useDispatch();
        const isMobile = useSelector(getIsMobile);
        const sportFilter = useSelector(getSportFilter);
        const selectedMarket = useSelector(getSelectedMarket);
        const [openedTable, setOpenedTable] = useState<SelectedMarketOpenedTable>(SelectedMarketOpenedTable.NONE);

        const isPlayerPropsFilter = sportFilter === SportFilter.PlayerProps;

        const isMarketPaused = market?.isPaused;

        return (
            <Wrapper>
                <HeaderContainer>
                    {market && (
                        <>
                            {isMobile && (
                                <MatchInfoLabel>
                                    {formatShortDateWithTime(new Date(market.maturityDate))}{' '}
                                </MatchInfoLabel>
                            )}
                            <MatchInfo>
                                <MatchLogosV2
                                    market={
                                        isPlayerPropsFilter
                                            ? {
                                                  ...market,
                                                  isPlayerPropsMarket: true,
                                                  isOneSideMarket: true,
                                                  playerProps: {
                                                      ...market.playerProps,
                                                      playerName: selectedMarket?.playerName || '',
                                                  },
                                              }
                                            : market
                                    }
                                    width={isMobile ? '55px' : '45px'}
                                    logoWidth={isMobile ? '30px' : '24px'}
                                    logoHeight={isMobile ? '30px' : '24px'}
                                />
                                <MatchLabel>
                                    {getMatchLabel(
                                        isPlayerPropsFilter
                                            ? {
                                                  ...market,
                                                  isPlayerPropsMarket: true,
                                                  isOneSideMarket: true,
                                                  homeTeam: selectedMarket?.playerName || '',
                                              }
                                            : market
                                    )}
                                </MatchLabel>
                            </MatchInfo>
                            {market.leagueId === League.US_ELECTION && <StyledUsElectionHeader />}
                            {isMobile && <Header market={market} />}
                        </>
                    )}
                    <CloseIcon
                        className="icon icon--close"
                        onClick={() => {
                            dispatch(setSelectedMarket(undefined));
                        }}
                    />
                </HeaderContainer>
                {market ? (
                    !isMarketPaused ? (
                        <>
                            <SelectedMarketDetails market={market} />
                            {isMobile && (
                                <>
                                    {openedTable !== SelectedMarketOpenedTable.GAME_STATS && (
                                        <TicketTransactions
                                            market={market}
                                            isOnSelectedMarket
                                            setOpenedTable={setOpenedTable}
                                        />
                                    )}
                                    {openedTable !== SelectedMarketOpenedTable.TICKET_TRANSACTIONS && (
                                        <GameStats market={market} isOnSelectedMarket setOpenedTable={setOpenedTable} />
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <Message>{t(`markets.market-card.live-trading-paused`)}</Message>
                    )
                ) : (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                )}
            </Wrapper>
        );
    },
    (prevProps, newProps) => {
        return isEqual(prevProps, newProps);
    }
);

const Wrapper = styled(FlexDivColumn)`
    margin-top: 10px;
    position: relative;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 8px;
    flex: 1 1 0;
    height: auto;
    @media (max-width: 950px) {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        margin-top: 0;
        border-radius: 0px;
        margin-right: 0px;
    }
`;

const HeaderContainer = styled(FlexDivColumn)`
    flex: initial;
    @media (max-width: 950px) {
        margin-bottom: 10px;
    }
`;

const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    width: 100%;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 0 0 8px 8px;
    flex: 1;
`;

const CloseIcon = styled.i`
    font-size: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    top: 0px;
    right: 0px;
    padding: 8px 10px;
    cursor: pointer;
    z-index: 100;
    @media (max-width: 950px) {
        right: 0px;
        top: 0px;
        font-size: 18px;
        padding: 12px 10px 15px 15px;
    }
`;

const MatchInfo = styled(FlexDivRow)`
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
    justify-content: center;
    height: 40px;
    @media (max-width: 950px) {
        height: 50px;
    }
`;

const MatchInfoLabel = styled.label`
    font-size: 11px;
    font-weight: 600;
    line-height: 12px;
    text-transform: uppercase;
    white-space: nowrap;
    margin-top: 15px;
    text-align: center;
    color: ${(props) => props.theme.textColor.quinary};
`;

const MatchLabel = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
`;

const StyledUsElectionHeader = styled(UsElectionHeader)`
    padding: 0 60px;
    @media (max-width: 950px) {
        padding: 0 40px;
    }
`;

export default SelectedMarket;
