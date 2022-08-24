import Button from 'components/Button';
import {
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
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { Position } from 'constants/options';
import { ethers } from 'ethers';
import Tags from 'pages/Markets/components/Tags';
import useMarketBalancesQuery from 'queries/markets/useMarketBalancesQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { Balances, SportMarketInfo } from 'types/markets';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import networkConnector from 'utils/networkConnector';

type MarketCardResolvedProps = {
    market: SportMarketInfo;
};

const MarketCardResolved: React.FC<MarketCardResolvedProps> = ({ market }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [balances, setBalances] = useState<Balances | undefined>(undefined);
    const [claimable, setClaimable] = useState<boolean>(false);
    const [claimableAmount, setClaimableAmount] = useState<number>(0);
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
                //@ts-ignore
                setClaimableAmount(balances?.[Position[market.finalResult - 1].toLowerCase()] * 1);
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

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    return (
        <MatchInfo>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isWinner={market.finalResult == 1} finalResult={market.finalResult}>
                    <MatchParticipantImage
                        alt="Home team logo"
                        src={homeLogoSrc}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
                </MatchParticipantImageContainer>
                <WinnerLabel isWinning={market.finalResult == 1} finalResult={market.finalResult}>
                    WINNER
                </WinnerLabel>
                <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
                <ScoreLabel>{market.homeScore}</ScoreLabel>
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchInfoLabel claimable={claimable}>{claimable ? 'CLAIMABLE' : 'FINISHED'}</MatchInfoLabel>
                <ClaimButton
                    onClick={(e: any) => {
                        e.preventDefault();
                        e.stopPropagation();
                        claimReward();
                    }}
                    claimable={claimable}
                >
                    CLAIM
                </ClaimButton>
                <MatchVSLabel>VS</MatchVSLabel>
                <WinnerLabel isWinning={market.finalResult == 3} finalResult={market.finalResult}>
                    DRAW
                </WinnerLabel>
                <ProfitLabel claimable={claimable} profit={claimableAmount}>{`$ ${claimableAmount.toFixed(
                    2
                )}`}</ProfitLabel>
                <Tags isFinished={market.finalResult != 0} sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isWinner={market.finalResult == 2} finalResult={market.finalResult}>
                    <MatchParticipantImage
                        alt="Away team logo"
                        src={awayLogoSrc}
                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                    />
                </MatchParticipantImageContainer>
                <WinnerLabel isWinning={market.finalResult == 2} finalResult={market.finalResult}>
                    WINNER
                </WinnerLabel>
                <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
                <ScoreLabel>{market.awayScore}</ScoreLabel>
            </MatchInfoColumn>
        </MatchInfo>
    );
};

const ClaimButton = styled(Button)<{ claimable?: boolean }>`
    position: absolute;
    top: 10%;
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.025em;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
`;

export default MarketCardResolved;
