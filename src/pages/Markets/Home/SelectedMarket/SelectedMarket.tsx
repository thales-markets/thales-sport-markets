import { ReactComponent as UsElectionHeader } from 'assets/images/us-election.svg';
import MatchLogosV2 from 'components/MatchLogosV2';
import SimpleLoader from 'components/SimpleLoader';
import { t } from 'i18next';
import { Message } from 'pages/Markets/Market/MarketDetailsV2/components/PositionsV2/styled-components';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { setSelectedMarket } from 'redux/modules/market';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarket } from 'types/markets';
import { getMatchLabel, isOddValid } from 'utils/marketsV2';
import { League } from '../../../../enums/sports';
import TicketTransactions from '../../Market/MarketDetailsV2/components/TicketTransactions';
import Header from '../Header';
import SelectedMarketDetails from '../SelectedMarketDetails';

const SelectedMarket: React.FC<{ market: SportMarket | undefined }> = ({ market }) => {
    const dispatch = useDispatch();
    const isMobile = useSelector(getIsMobile);

    const areOddsValid = market?.odds.some((odd) => isOddValid(odd));

    // TODO: remove, rely on market.paused from api response once implemented
    const marketPaused = useMemo(() => {
        // when market odds are stale API sets odds to []
        if (!market?.odds.length) {
            return true;
        }
        if (areOddsValid) {
            return false;
        }
        if (market?.childMarkets.some((child) => child.odds.some((odd) => isOddValid(odd)))) {
            return false;
        }
        return true;
    }, [market, areOddsValid]);

    return (
        <Wrapper>
            <HeaderContainer>
                {market && (
                    <>
                        {isMobile && (
                            <MatchInfoLabel>{formatShortDateWithTime(new Date(market.maturityDate))} </MatchInfoLabel>
                        )}
                        <MatchInfo>
                            <MatchLogosV2
                                market={market}
                                width={isMobile ? '55px' : '45px'}
                                logoWidth={isMobile ? '30px' : '24px'}
                                logoHeight={isMobile ? '30px' : '24px'}
                            />
                            <MatchLabel>{getMatchLabel(market)} </MatchLabel>
                        </MatchInfo>
                        {market.leagueId === League.US_ELECTION && <StyledUsElectionHeader />}
                        {isMobile && <Header />}
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
                !marketPaused ? (
                    <>
                        <SelectedMarketDetails market={market} />
                        {isMobile && <TicketTransactions market={market} isOnSelectedMarket />}
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
};

const Wrapper = styled(FlexDivColumn)`
    margin-top: 10px;
    position: relative;
    background-color: ${(props) => props.theme.background.quinary};
    border-radius: 8px;
    flex: 1 1 0;
    height: auto;
    margin-right: 15px;
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
