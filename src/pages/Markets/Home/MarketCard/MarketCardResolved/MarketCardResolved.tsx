import Button from 'components/Button';
import {
    ApexMatchInfoColumn,
    BetTypeInfo,
    MarketInfoContainer,
    MatchDate,
    MatchInfo,
    MatchInfoColumn,
    MatchInfoLabel,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchParticipantName,
    MatchVSLabel,
    ProfitLabel,
    ScoreLabel,
    WinnerLabel,
} from 'components/common';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ApexBetTypeKeyMapping } from 'constants/markets';
import { ethers } from 'ethers';
import Tags from 'pages/Markets/components/Tags';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Colors } from 'styles/common';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { formatDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { getIsApexTopGame, isApexGame, isClaimAvailable, isMlsGame } from 'utils/markets';
import networkConnector from 'utils/networkConnector';

type MarketCardResolvedProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
};

const MarketCardResolved: React.FC<MarketCardResolvedProps> = ({ market, accountPositions }) => {
    const { t } = useTranslation();
    const claimable = isClaimAvailable(accountPositions);

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

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    return (
        <>
            <MatchInfo>
                <MatchInfoColumn isApexTopGame={isApexTopGame}>
                    <MatchParticipantImageContainer
                        isWinner={market.finalResult == 1 && !isApexTopGame}
                        finalResult={market.finalResult}
                        isApexTopGame={isApexTopGame}
                    >
                        <MatchParticipantImage
                            alt="Home team logo"
                            src={homeLogoSrc}
                            onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                        />
                    </MatchParticipantImageContainer>
                    {!isApexTopGame && (
                        <>
                            <WinnerLabel isWinning={market.finalResult == 1} finalResult={market.finalResult}>
                                {t('common.winner')}
                            </WinnerLabel>
                            <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
                        </>
                    )}
                    <ScoreLabel>{market.homeScore}</ScoreLabel>
                </MatchInfoColumn>
                <MatchInfoColumn isApexTopGame={isApexTopGame}>
                    <MarketInfoContainer>
                        <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
                        <MatchInfoLabel claimable={claimable} isPaused={market.isPaused}>
                            {market.isPaused
                                ? t('markets.market-card.paused')
                                : claimable
                                ? ''
                                : t('markets.market-card.finished')}
                        </MatchInfoLabel>
                        {!market.isPaused && claimable && (
                            <ClaimButton
                                onClick={(e: any) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    claimReward();
                                }}
                                claimable={claimable}
                            >
                                {t('markets.market-card.claim')}
                            </ClaimButton>
                        )}
                    </MarketInfoContainer>
                    {isApexTopGame ? (
                        <BetTypeInfo>
                            {t(`common.top-bet-type-title`, {
                                driver: market.homeTeam,
                                betType: t(`common.${ApexBetTypeKeyMapping[market.betType]}`),
                                race: market.leagueRaceName,
                            })}
                        </BetTypeInfo>
                    ) : (
                        <>
                            <MatchVSLabel>
                                {t('markets.market-card.vs')}
                                {isApexGame(market.tags[0]) && (
                                    <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={22} marginLeft={2} />
                                )}
                                {isMlsGame(market.tags[0]) && (
                                    <Tooltip overlay={t(`common.mls-tooltip`)} iconFontSize={22} marginLeft={2} />
                                )}
                            </MatchVSLabel>
                            <WinnerLabel isWinning={market.finalResult == 3} finalResult={market.finalResult}>
                                {t('markets.market-card.draw')}
                            </WinnerLabel>
                            <ProfitLabel claimable={false}>{''}</ProfitLabel>
                        </>
                    )}
                    <Tags isFinished={market.finalResult != 0} sport={market.sport} tags={market.tags} />
                </MatchInfoColumn>
                {!isApexTopGame && (
                    <MatchInfoColumn>
                        <MatchParticipantImageContainer
                            isWinner={market.finalResult == 2}
                            finalResult={market.finalResult}
                        >
                            <MatchParticipantImage
                                alt="Away team logo"
                                src={awayLogoSrc}
                                onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                            />
                        </MatchParticipantImageContainer>
                        <WinnerLabel isWinning={market.finalResult == 2} finalResult={market.finalResult}>
                            {t('common.winner')}
                        </WinnerLabel>
                        <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
                        <ScoreLabel>{market.awayScore}</ScoreLabel>
                    </MatchInfoColumn>
                )}
            </MatchInfo>
            {isApexTopGame && (
                <MatchInfo>
                    <ApexMatchInfoColumn>
                        <MatchParticipantName winningColor={market.finalResult == 1 ? Colors.GREEN : undefined}>
                            {t('common.yes')}
                        </MatchParticipantName>
                        <WinnerLabel isWinning={market.finalResult == 1} finalResult={market.finalResult}>
                            {t('common.winner')}
                        </WinnerLabel>
                    </ApexMatchInfoColumn>
                    <ApexMatchInfoColumn>
                        <MatchParticipantName winningColor={market.finalResult == 2 ? Colors.GREEN : undefined}>
                            {t('common.no')}
                        </MatchParticipantName>
                        <WinnerLabel isWinning={market.finalResult == 2} finalResult={market.finalResult}>
                            {t('common.winner')}
                        </WinnerLabel>
                    </ApexMatchInfoColumn>
                </MatchInfo>
            )}
        </>
    );
};

const ClaimButton = styled(Button)<{ claimable?: boolean }>`
    /* position: absolute; */
    top: 10%;
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.025em;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
`;

export default MarketCardResolved;
