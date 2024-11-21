import { SportMarket } from 'types/markets';
import {
    ArrowIcon,
    GameOfLabel,
    MatchTeamsLabel,
    MatchTimeLabel,
    MatchTimeLabelContainer,
    PlayerPropsHeader,
} from './styled-components';
import MatchLogosV2 from 'components/MatchLogosV2';
import MarketListCardV2 from '../MarketListCard';
import { FlexDivColumn, FlexDivRowCentered } from 'styles/common';
import Tooltip from 'components/Tooltip';
import TimeRemaining from 'components/TimeRemaining';
import { formatShortDateWithTime } from 'thales-utils';
import { useTranslation } from 'react-i18next';
import { getTeamNameV2 } from 'utils/marketsV2';
import { useMemo, useState } from 'react';
import { getSelectedMarket } from 'redux/modules/market';
import { useSelector } from 'react-redux';
import useGameMultipliersQuery from 'queries/overdrop/useGameMultipliersQuery';
import { getIsAppReady } from 'redux/modules/app';

const GameList: React.FC<{ markets: SportMarket[]; language: string }> = ({ markets, language }) => {
    const { t } = useTranslation();

    const isAppReady = useSelector(getIsAppReady);
    const selectedMarket = useSelector(getSelectedMarket);

    const parentMarket = { ...markets[0], isPlayerPropsMarket: false, isOneSideMarket: false };

    const [hideMarkets, setHidemarkets] = useState<boolean>(false);

    const gameMultipliersQuery = useGameMultipliersQuery({
        enabled: isAppReady,
    });

    const overdropGameMultiplier = useMemo(() => {
        const gameMultipliers =
            gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : [];
        return gameMultipliers.find((multiplier) => multiplier.gameId === parentMarket.gameId);
    }, [gameMultipliersQuery.data, gameMultipliersQuery.isSuccess, parentMarket.gameId]);

    return (
        <>
            <PlayerPropsHeader onClick={() => setHidemarkets(!hideMarkets)} marketSelected={!!selectedMarket}>
                <FlexDivRowCentered gap={20}>
                    <MatchLogosV2
                        market={parentMarket}
                        width={!!selectedMarket ? '30px' : '45px'}
                        height="30px"
                        logoWidth={!!selectedMarket ? '24px' : '34px'}
                        logoHeight={!!selectedMarket ? '24px' : '34px'}
                    />
                    <FlexDivColumn gap={3}>
                        <Tooltip
                            overlay={
                                <>
                                    {t(`markets.market-card.starts-in`)}:{' '}
                                    <TimeRemaining end={markets[0].maturityDate} fontSize={11} />
                                </>
                            }
                            component={
                                <MatchTimeLabelContainer gap={5}>
                                    <MatchTimeLabel marketSelected={!!selectedMarket}>
                                        {formatShortDateWithTime(new Date(markets[0].maturityDate))}{' '}
                                    </MatchTimeLabel>
                                    {!selectedMarket && (
                                        <GameOfLabel>
                                            {overdropGameMultiplier && `Game of the ${overdropGameMultiplier.type}`}
                                        </GameOfLabel>
                                    )}
                                </MatchTimeLabelContainer>
                            }
                        />
                        <MatchTeamsLabel overdropBoosted={!!overdropGameMultiplier} marketSelected={!!selectedMarket}>
                            <span>{getTeamNameV2(parentMarket, 0)}</span>
                            {!selectedMarket && <span>-</span>}
                            <span>{getTeamNameV2(parentMarket, 1)}</span>
                        </MatchTeamsLabel>
                    </FlexDivColumn>
                </FlexDivRowCentered>
                {hideMarkets ? (
                    <ArrowIcon className={`icon icon--caret-right`} />
                ) : (
                    <ArrowIcon down={true} className={`icon icon--caret-down`} />
                )}
            </PlayerPropsHeader>
            {!hideMarkets &&
                markets.map((market: SportMarket, index: number) => (
                    <MarketListCardV2 language={language} market={market} key={index + 'list'} />
                ))}
        </>
    );
    {
    }
};

export default GameList;
