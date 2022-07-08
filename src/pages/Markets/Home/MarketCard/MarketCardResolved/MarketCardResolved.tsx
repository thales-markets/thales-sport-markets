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
import Tags from 'pages/Markets/components/Tags';
import useMarketBalancesQuery from 'queries/markets/useMarketBalancesQuery';
import useMarketQuery from 'queries/markets/useMarketQuery';
import useUserTransactionsPerMarketQuery from 'queries/markets/useUserTransactionsPerMarketQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Balances, MarketData, MarketTransactions, SportMarketInfo, UserTransactions } from 'types/markets';
import { getEtherscanTxLink } from 'utils/etherscan';
import { getTeamImageSource } from 'utils/images';
import { Position, PositionName } from 'constants/options';
import { ethers } from 'ethers';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import networkConnector from 'utils/networkConnector';
import { toast } from 'react-toastify';
import { getSuccessToastOptions, getErrorToastOptions } from 'config/toast';

type MarketCardResolvedProps = {
    market: SportMarketInfo;
};

const MarketCardResolved: React.FC<MarketCardResolvedProps> = ({ market }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [marketData, setMarketData] = useState<MarketData | undefined>(undefined);
    const [balances, setBalances] = useState<Balances | undefined>(undefined);
    const [userTransactions, setUserTransactions] = useState<MarketTransactions>([]);
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [claimable, setClaimable] = useState<boolean>(false);
    const userTransactionsQuery = useUserTransactionsPerMarketQuery(walletAddress, market.address, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const marketBalancesQuery = useMarketBalancesQuery(market.address, walletAddress, {
        enabled: isWalletConnected,
    });

    const marketQuery = useMarketQuery(market.address);

    useEffect(() => {
        if (marketQuery.isSuccess && marketQuery.data) {
            setMarketData(marketQuery.data);
        }
    }, [marketQuery.isSuccess, marketQuery.data]);

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    useEffect(() => {
        if (userTransactionsQuery.isSuccess && userTransactionsQuery.data) {
            setUserTransactions(userTransactionsQuery.data);
        }
    }, [userTransactionsQuery.isSuccess, userTransactionsQuery.data]);

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
    }, [balances]);

    const userTransactionsWithMarket: UserTransactions = useMemo(() => {
        return userTransactions.map((tx) => {
            return {
                ...tx,
                game: `${market.homeTeam} - ${market.awayTeam}`,
                result: Position[market.finalResult] as PositionName,
                // @ts-ignore
                usdValue: +market[`${tx.position.toLowerCase()}Odds`] * +tx.amount,
                // @ts-ignore
                positionTeam: market[`${tx.position.toLowerCase()}Team`],
                link: getEtherscanTxLink(networkId, tx.hash),
            };
        });
    }, [marketData, userTransactions]);

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

    const profit: number = useMemo(() => {
        let winningAmount = 0;
        let losingAmount = 0;
        userTransactionsWithMarket.forEach((tx) => {
            const marketResult = Position[market.finalResult - 1];
            if (tx.position == marketResult) {
                winningAmount += Number(tx.amount) - tx.usdValue;
            } else {
                losingAmount += tx.usdValue;
            }
        });
        return winningAmount - losingAmount;
    }, [marketData, userTransactionsWithMarket]);

    return (
        <MatchInfo>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isWinner={market.finalResult == 1} finalResult={market.finalResult}>
                    <MatchParticipantImage src={getTeamImageSource(market.homeTeam, market.tags[0])} />
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
                <ProfitLabel claimable={claimable} profit={profit}>{`$ ${profit.toFixed(2)}`}</ProfitLabel>
                <Tags isFinished={market.finalResult != 0} sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isWinner={market.finalResult == 2} finalResult={market.finalResult}>
                    <MatchParticipantImage src={getTeamImageSource(market.awayTeam, market.tags[0])} />
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
