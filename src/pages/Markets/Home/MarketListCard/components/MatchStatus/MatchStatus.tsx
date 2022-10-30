import Button from 'components/Button';
import { getSuccessToastOptions, getErrorToastOptions } from 'config/toast';
import { STATUS_COLOR } from 'constants/ui';
import { ethers } from 'ethers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import networkConnector from 'utils/networkConnector';

type MatchStatusProps = {
    address: string;
    isResolved: boolean;
    isLive?: boolean;
    isCanceled?: boolean;
    isClaimable?: boolean;
    result?: string;
    startsAt?: string;
    isPaused: boolean;
};

const MatchStatus: React.FC<MatchStatusProps> = ({
    address,
    isResolved,
    isLive,
    isCanceled,
    isClaimable,
    result,
    startsAt,
    isPaused,
}) => {
    const { t } = useTranslation();

    const regularFlag = !isResolved && !isCanceled && !isLive && !isClaimable;
    const isPending = isLive && !isResolved && !isCanceled && !isClaimable;

    const claimReward = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const contract = new ethers.Contract(address, sportsMarketContract.abi, signer);
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

    return (
        <Container resolved={isResolved && !isCanceled}>
            {isPaused ? (
                <>
                    <Status color={STATUS_COLOR.PAUSED}>{t('markets.market-card.paused')}</Status>
                    <MatchStarts>{`${startsAt}`}</MatchStarts>
                </>
            ) : (
                <>
                    {isCanceled && <Status color={STATUS_COLOR.CANCELED}>{t('markets.market-card.canceled')}</Status>}
                    {regularFlag && <MatchStarts>{`${startsAt}`}</MatchStarts>}
                    {isResolved && !isClaimable && !isCanceled && (
                        <>
                            <ResultLabel>{t('markets.market-card.result')}:</ResultLabel>
                            <Result isLive={isLive}>{result}</Result>
                        </>
                    )}
                    {isResolved && isClaimable && !isCanceled && (
                        <>
                            <ClaimButton
                                onClick={(e: any) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    claimReward();
                                }}
                                claimable={isClaimable}
                            >
                                {t('markets.market-card.claim')}
                            </ClaimButton>
                            <ResultLabel>{t('markets.market-card.result')}:</ResultLabel>
                            <Result isLive={isLive}>{result}</Result>
                        </>
                    )}
                    {isPending && (
                        <>
                            <Status color={STATUS_COLOR.STARTED} style={{ fontWeight: '500' }}>
                                {t('markets.market-card.pending-resolution')}
                            </Status>
                        </>
                    )}
                    {!regularFlag && <MatchStarts>{`${startsAt}`}</MatchStarts>}
                </>
            )}
        </Container>
    );
};

const Container = styled.div<{ resolved?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    margin-right: 15px;
    width: ${(_props) => (_props?.resolved ? '33%' : '')};
`;

export const Status = styled.span<{ color?: string }>`
    font-size: 12px;
    text-transform: uppercase;
    color: ${(_props) => (_props?.color ? _props.color : '')};
`;

const Result = styled.span<{ isLive?: boolean }>`
    font-size: ${(_props) => (_props?.isLive ? '12px' : '12px')};
    font-weight: ${(_props) => (_props?.isLive ? '400' : '700')};
    // margin-right: ${(_props) => (_props?.isLive ? '7px' : '50px')};
`;

const ResultLabel = styled.span`
    font-weight: 300;
    font-size: 12px;
    margin-right: 2px;
`;

const MatchStarts = styled.span`
    justify-self: start;
    text-align: left;
    color: #ffffff;
    text-transform: uppercase;
    margin-left: 5px;
    font-size: 12px;
`;

const ClaimButton = styled(Button)<{ claimable?: boolean }>`
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    margin-right: 20px;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 5px;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.025em;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
`;

export default MatchStatus;
