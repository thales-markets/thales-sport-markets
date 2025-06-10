import Button from 'components/Button';
import Scroll from 'components/Scroll';
import { MarketTypeGroupsBySport } from 'constants/marketTypes';
import { SportFilter } from 'enums/markets';
import { RiskManagementConfig } from 'enums/riskManagement';
import { t } from 'i18next';
import { groupBy } from 'lodash';
import { isFuturesMarket, isSgpBuilderMarket, League, MarketType, PLAYER_PROPS_MARKET_TYPES } from 'overtime-utils';
import useRiskManagementConfigQuery from 'queries/riskManagement/useRiskManagementConfig';
import useTeamPlayersInfoQuery from 'queries/teams/useTeamPlayersInfoQuery';
import React, { useMemo, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import {
    getMarketTypeGroupFilter,
    getSelectedMarket,
    getSportFilter,
    setMarketTypeGroupFilter,
} from 'redux/modules/market';
import { useTheme } from 'styled-components';
import { SportMarket, TeamPlayersData } from 'types/markets';
import { RiskManagementSgpBuilders } from 'types/riskManagement';
import { getTicketPositionsFogSgpBuilder, isOddValid } from 'utils/marketsV2';
import { useChainId } from 'wagmi';
import { ThemeInterface } from '../../../../types/ui';
import PositionsV2 from '../../Market/MarketDetailsV2/components/PositionsV2';
import { NoMarketsContainer, NoMarketsLabel, Wrapper } from './styled-components';

type SelectedMarketDetailsProps = {
    market: SportMarket;
};

const SelectedMarketDetails: React.FC<SelectedMarketDetailsProps> = ({ market }) => {
    const theme: ThemeInterface = useTheme();
    const dispatch = useDispatch();
    const networkId = useChainId();

    const isGameStarted = market.maturityDate < new Date();
    const isGameOpen = market.isOpen && !isGameStarted;
    const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);
    const isMobile = useSelector(getIsMobile);
    const sportFilter = useSelector(getSportFilter);
    const selectedMarket = useSelector(getSelectedMarket);

    const riskManagementSgpBuildersQuery = useRiskManagementConfigQuery([RiskManagementConfig.SGP_BUILDERS], {
        networkId,
    });

    const sgpBuilders = useMemo(
        () =>
            riskManagementSgpBuildersQuery.isSuccess && riskManagementSgpBuildersQuery.data
                ? (riskManagementSgpBuildersQuery.data as RiskManagementSgpBuilders).sgpBuilders
                : [],
        [riskManagementSgpBuildersQuery.isSuccess, riskManagementSgpBuildersQuery.data]
    );

    const teamPlayersInfoQuery = useTeamPlayersInfoQuery({ networkId }, { enabled: sgpBuilders.length > 0 });

    const homeTeamPlayerIds = useMemo(
        () =>
            teamPlayersInfoQuery.isSuccess && teamPlayersInfoQuery.data
                ? ((teamPlayersInfoQuery.data as TeamPlayersData).get(market.homeTeam.toLowerCase()) || [])
                      .filter((teamPlayer) => teamPlayer.playerId)
                      .map((teamPlayer) => teamPlayer.playerId)
                : [],
        [teamPlayersInfoQuery.isSuccess, teamPlayersInfoQuery.data, market]
    );

    const awayTeamPlayerIds = useMemo(
        () =>
            teamPlayersInfoQuery.isSuccess && teamPlayersInfoQuery.data
                ? ((teamPlayersInfoQuery.data as TeamPlayersData).get(market.awayTeam.toLowerCase()) || [])
                      .filter((teamPlayer) => teamPlayer.playerId)
                      .map((teamPlayer) => teamPlayer.playerId)
                : [],
        [teamPlayersInfoQuery.isSuccess, teamPlayersInfoQuery.data, market]
    );

    const playerName = useMemo(() => selectedMarket?.playerName, [selectedMarket?.playerName]);

    // hack to rerender scroll due to bug in scroll component when scroll should change state (become hidden/visible)
    const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
    const refreshScroll = () => {
        if (ignored >= 0) {
            forceUpdate();
        }
    };

    const marketTypesFilter = useMemo(() => {
        const marketTypeGroupFilters = marketTypeGroupFilter
            ? MarketTypeGroupsBySport[market.sport][marketTypeGroupFilter] || []
            : [];
        const playerPropsFilters = sportFilter === SportFilter.PlayerProps ? PLAYER_PROPS_MARKET_TYPES : [];

        return marketTypeGroupFilters.length ? marketTypeGroupFilters : playerPropsFilters;
    }, [market.sport, marketTypeGroupFilter, sportFilter]);

    const groupedChildMarkets = useMemo(
        () =>
            groupBy(
                market.childMarkets.filter(
                    (childMarket) =>
                        !marketTypesFilter.length ||
                        (marketTypesFilter.includes(childMarket.typeId) &&
                            (!playerName || childMarket.playerProps.playerName === playerName))
                ),
                (childMarket: SportMarket) => childMarket.typeId
            ),
        [market.childMarkets, marketTypesFilter, playerName]
    );

    const numberOfMarkets = useMemo(() => {
        let num =
            !marketTypesFilter.length || marketTypesFilter.includes(MarketType.WINNER) || isFuturesMarket(market.typeId)
                ? 1
                : 0;
        Object.keys(groupedChildMarkets).forEach((key) => {
            const typeId = Number(key);
            const childMarkets = groupedChildMarkets[typeId];
            num += childMarkets.length;
        });
        return num;
    }, [groupedChildMarkets, market.typeId, marketTypesFilter]);

    const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
        childMarket.odds.some((odd) => isOddValid(odd))
    );

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const hideGame = isGameOpen && !areOddsValid && !areChildMarketsOddsValid;

    return (
        <Scroll height={`calc(100vh - ${isMobile ? 0 : market.leagueId === League.US_ELECTION ? 280 : 194}px)`}>
            <Wrapper hideGame={hideGame}>
                {numberOfMarkets === 0 ? (
                    <NoMarketsContainer>
                        <NoMarketsLabel>{`${t('market.no-markets-found')} ${marketTypeGroupFilter}`}</NoMarketsLabel>
                        <Button
                            onClick={() => dispatch(setMarketTypeGroupFilter(undefined))}
                            backgroundColor={theme.button.background.secondary}
                            textColor={theme.button.textColor.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            height="24px"
                            fontSize="12px"
                        >
                            {t('market.view-all-markets')}
                        </Button>
                    </NoMarketsContainer>
                ) : (
                    <>
                        {(!marketTypesFilter.length || marketTypesFilter.includes(MarketType.WINNER)) && (
                            <PositionsV2
                                markets={[market]}
                                marketType={market.typeId}
                                isGameOpen={isGameOpen}
                                onAccordionClick={refreshScroll}
                                hidePlayerName={sportFilter === SportFilter.PlayerProps}
                                alignHeader={sportFilter === SportFilter.PlayerProps}
                            />
                        )}
                        {Object.keys(groupedChildMarkets).map((key, index) => {
                            const typeId = Number(key);
                            const childMarkets = groupedChildMarkets[typeId];
                            const sgpBuildersWithTicketPositions = isSgpBuilderMarket(typeId)
                                ? sgpBuilders.map((sgpBuilder) => ({
                                      sgpBuilder,
                                      ticketPositions: getTicketPositionsFogSgpBuilder(
                                          market,
                                          sgpBuilder,
                                          homeTeamPlayerIds,
                                          awayTeamPlayerIds
                                      ),
                                  }))
                                : [];
                            return (
                                <PositionsV2
                                    key={index}
                                    markets={childMarkets}
                                    marketType={typeId}
                                    isGameOpen={isGameOpen}
                                    onAccordionClick={refreshScroll}
                                    hidePlayerName={sportFilter === SportFilter.PlayerProps}
                                    alignHeader={sportFilter === SportFilter.PlayerProps}
                                    sgpTickets={sgpBuildersWithTicketPositions}
                                />
                            );
                        })}
                    </>
                )}
            </Wrapper>
        </Scroll>
    );
};

export default SelectedMarketDetails;
