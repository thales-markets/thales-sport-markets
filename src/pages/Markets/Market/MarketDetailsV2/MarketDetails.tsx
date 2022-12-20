import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MatchInfo from './components/MatchInfo';
import BackToLink from 'pages/Markets/components/BackToLink';
import { ChildMarkets, MarketData } from 'types/markets';
import Positions from './components/Positions';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import styled from 'styled-components';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import Parlay from 'pages/Markets/Home/Parlay';
import Transactions from '../Transactions';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import useChildMarketsQuery from 'queries/markets/useChildMarketsQuery';
import { MAIN_COLORS } from 'constants/ui';
import { BetType } from 'constants/tags';
import FooterSidebarMobile from 'components/FooterSidebarMobile';
import ParlayMobileModal from 'pages/Markets/Home/Parlay/components/ParlayMobileModal';

type MarketDetailsPropType = {
    market: MarketData;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const [showParlayMobileModal, setShowParlayMobileModal] = useState<boolean>(false);

    const [childMarkets, setChildMarkets] = useState<ChildMarkets>({
        spreadMarkets: [],
        totalMarkets: [],
    });

    const childMarketsQuery = useChildMarketsQuery(market, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (childMarketsQuery.isSuccess && childMarketsQuery.data) {
            setChildMarkets(childMarketsQuery.data);
        }
    }, [childMarketsQuery.isSuccess, childMarketsQuery.data]);

    const showAMM = !market.resolved && !market.cancelled && !market.gameStarted && !market.paused;

    const isGameCancelled = market.cancelled || (!market.gameStarted && market.resolved);
    const isGameResolved = market.resolved || market.cancelled;
    const isPendingResolution = market.gameStarted && !isGameResolved;
    const isGamePaused = market.paused && !isGameResolved;
    const showStatus = market.resolved || market.cancelled || market.gameStarted || market.paused;

    return (
        <RowContainer>
            <MainContainer showAMM={showAMM}>
                <HeaderWrapper>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('market.back')}
                        customStylingContainer={{ position: 'absolute', left: 0, top: 0, marginTop: 0 }}
                    />
                </HeaderWrapper>
                <MatchInfo market={market} />
                {showStatus && (
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
                <>
                    <Positions markets={[market]} betType={BetType.WINNER} />
                    {childMarkets.spreadMarkets.length > 0 && (
                        <Positions markets={childMarkets.spreadMarkets} betType={BetType.SPREAD} />
                    )}
                    {childMarkets.totalMarkets.length > 0 && (
                        <Positions markets={childMarkets.totalMarkets} betType={BetType.TOTAL} />
                    )}
                </>
                <Transactions market={market} />
            </MainContainer>
            {showAMM && (
                <SidebarContainer>
                    <Parlay />
                </SidebarContainer>
            )}
            {isMobile && showParlayMobileModal && <ParlayMobileModal onClose={() => setShowParlayMobileModal(false)} />}
            {isMobile && <FooterSidebarMobile setParlayMobileVisibility={setShowParlayMobileModal} />}
        </RowContainer>
    );
};

const RowContainer = styled(FlexDivRow)`
    margin-top: 40px;
    width: 100%;
    flex-direction: row;
    justify-content: center;
    @media (max-width: 575px) {
        margin-top: 20px;
    }
`;

const MainContainer = styled(FlexDivColumn)<{ showAMM: boolean }>`
    width: 100%;
    max-width: 800px;
    margin-right: ${(props) => (props.showAMM ? 10 : 0)}px;
    @media (max-width: 575px) {
        margin-right: 0;
    }
`;

const SidebarContainer = styled(FlexDivColumn)`
    max-width: 320px;
    @media (max-width: 950px) {
        display: none;
    }
`;

const HeaderWrapper = styled(FlexDivRow)`
    width: 100%;
    position: relative;
    align-items: center;
`;

export const Status = styled(FlexDivCentered)<{ backgroundColor?: string }>`
    width: 100%;
    border-radius: 15px;
    background-color: ${(props) => props.backgroundColor || MAIN_COLORS.LIGHT_GRAY};
    padding: 10px 50px;
    margin-bottom: 7px;
    font-weight: 600;
    font-size: 21px;
    line-height: 110%;
    text-transform: uppercase;
    color: ${MAIN_COLORS.TEXT.WHITE};
`;

export default MarketDetails;
