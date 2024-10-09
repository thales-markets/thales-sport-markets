import { ReactComponent as UsElectionHeader } from 'assets/images/us-election.svg';
import MatchLogosV2 from 'components/MatchLogosV2';
import SimpleLoader from 'components/SimpleLoader';
import { t } from 'i18next';
import { Message } from 'pages/Markets/Market/MarketDetailsV2/components/PositionsV2/styled-components';
import useSportMarketV2Query from 'queries/markets/useSportMarketV2Query';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getSelectedMarket, setSelectedMarket } from 'redux/modules/market';
import { getNetworkId } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarket } from 'types/markets';
import { getMatchLabel } from 'utils/marketsV2';
import { League } from '../../../../enums/sports';
import TicketTransactions from '../../Market/MarketDetailsV2/components/TicketTransactions';
import Header from '../Header';
import SelectedMarketDetails from '../SelectedMarketDetails';

const SelectedMarket: React.FC = () => {
    const dispatch = useDispatch();
    const selectedMarket = useSelector(getSelectedMarket);
    const isAppReady = useSelector(getIsAppReady);
    const networkId = useSelector(getNetworkId);
    const isMobile = useSelector(getIsMobile);
    const [lastValidMarket, setLastValidMarket] = useState<SportMarket | undefined>(undefined);

    const marketQuery = useSportMarketV2Query(selectedMarket?.gameId || '', true, !!selectedMarket?.live, networkId, {
        enabled: isAppReady && !!selectedMarket,
    });

    const isMarketPaused = lastValidMarket?.isPaused;

    useEffect(() => {
        if (marketQuery.isSuccess && marketQuery.data) {
            setLastValidMarket(marketQuery.data);
        }
    }, [selectedMarket, marketQuery.isSuccess, marketQuery.data]);

    return (
        <Wrapper>
            <HeaderContainer>
                {lastValidMarket && (
                    <>
                        {isMobile && (
                            <MatchInfoLabel>
                                {formatShortDateWithTime(new Date(lastValidMarket.maturityDate))}{' '}
                            </MatchInfoLabel>
                        )}
                        <MatchInfo>
                            <MatchLogosV2
                                market={lastValidMarket}
                                width={isMobile ? '55px' : '45px'}
                                logoWidth={isMobile ? '30px' : '24px'}
                                logoHeight={isMobile ? '30px' : '24px'}
                            />
                            <MatchLabel>{getMatchLabel(lastValidMarket)} </MatchLabel>
                        </MatchInfo>
                        {lastValidMarket.leagueId === League.US_ELECTION && <StyledUsElectionHeader />}
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
            {lastValidMarket && !marketQuery.isLoading ? (
                !isMarketPaused ? (
                    <>
                        <SelectedMarketDetails market={lastValidMarket} />
                        {isMobile && <TicketTransactions market={lastValidMarket} isOnSelectedMarket />}
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
