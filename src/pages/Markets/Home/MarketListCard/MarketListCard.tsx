import { getSuccessToastOptions, getErrorToastOptions } from 'config/toast';
import { ethers } from 'ethers';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { formatDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isClaimAvailable } from 'utils/markets';
import networkConnector from 'utils/networkConnector';
import MatchStatus from './components/MatchStatus';
import Odds from './components/Odds';
import { ClubContainer, ClubLogo, ClubNameLabel, ClubVsClubContainer, Container, VSLabel } from './styled-components';

type MarketRowCardProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, accountPositions }) => {
    const claimAvailable = isClaimAvailable(accountPositions);

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

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
        <Container claimBorder={claimAvailable} isCanceled={market.isCanceled} isResolved={market.isResolved}>
            <ClubVsClubContainer>
                <ClubContainer>
                    <ClubLogo
                        alt="Home team logo"
                        src={homeLogoSrc}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
                    <ClubNameLabel>{market.homeTeam}</ClubNameLabel>
                </ClubContainer>
                <VSLabel>{'VS'}</VSLabel>
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
                isClaimable={claimAvailable}
                result={`${market.homeScore}:${market.awayScore}`}
                startsAt={formatDateWithTime(market.maturityDate)}
                claimReward={claimReward}
            />
        </Container>
    );
};

export default MarketListCard;
