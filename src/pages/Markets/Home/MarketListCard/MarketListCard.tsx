import { getSuccessToastOptions, getErrorToastOptions } from 'config/toast';
import { ethers } from 'ethers';
import { t } from 'i18next';
import useMarketBalancesQuery from 'queries/markets/useMarketBalancesQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Position } from 'constants/options';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { AccountPosition, Balances, SportMarketInfo } from 'types/markets';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { formatDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import networkConnector from 'utils/networkConnector';
import MatchStatus from './components/MatchStatus';
import Odds from './components/Odds';
import { ClubContainer, ClubLogo, ClubNameLabel, ClubVsClubContainer, Container, VSLabel } from './styled-components';
import Tooltip from 'components/Tooltip';
import { isApexGame } from 'utils/markets';

type MarketRowCardProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, accountPositions }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [claimable, setClaimable] = useState<boolean>(false);
    const [balances, setBalances] = useState<Balances | undefined>(undefined);

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    const marketBalancesQuery = useMarketBalancesQuery(market.address, walletAddress, {
        enabled: isWalletConnected && isAppReady,
    });

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    useEffect(() => {
        if (balances) {
            if (
                market.finalResult !== 0 &&
                //@ts-ignore
                balances?.[Position[market.finalResult - 1].toLowerCase()] > 0
            ) {
                setClaimable(true);
            }
        }
    }, [balances, market.finalResult]);

    const claimReward = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const contract = new ethers.Contract(market.address, sportsMarketContract.abi, signer);
            contract.connect(signer);
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            try {
                const tx = await contract.exerciseOptions();
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.claim-winnings-success')));
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
        }
    };

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    return (
        <Container claimBorder={claimable} isCanceled={market.isCanceled} isResolved={market.isResolved}>
            <ClubVsClubContainer>
                <ClubContainer>
                    <ClubLogo
                        alt="Home team logo"
                        src={homeLogoSrc}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
                    <ClubNameLabel>{market.homeTeam}</ClubNameLabel>
                </ClubContainer>
                <VSLabel>
                    {'VS'}
                    {isApexGame(market.tags[0]) && (
                        <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={17} marginLeft={2} />
                    )}
                </VSLabel>
                <ClubContainer>
                    <ClubLogo
                        alt="Away team logo"
                        src={awayLogoSrc}
                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                    />
                    <ClubNameLabel>{market.awayTeam}</ClubNameLabel>
                </ClubContainer>
            </ClubVsClubContainer>
            <Odds
                isResolved={market.isResolved}
                finalResult={market.finalResult}
                isLive={market.maturityDate < new Date()}
                isCancelled={market.isCanceled}
                odds={{
                    homeOdds: market.homeOdds,
                    awayOdds: market.awayOdds,
                    drawOdds: market.drawOdds,
                }}
                accountPositions={accountPositions}
            />
            <MatchStatus
                isResolved={market.isResolved}
                isLive={market.maturityDate < new Date()}
                isCanceled={market.isCanceled}
                isClaimable={claimable}
                result={`${market.homeScore}:${market.awayScore}`}
                startsAt={formatDateWithTime(market.maturityDate)}
                claimReward={claimReward}
            />
        </Container>
    );
};

export default MarketListCard;
