import Button from 'components/Button';
import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type MatchStatusProps = {
    isResolved: boolean;
    isLive?: boolean;
    isCanceled?: boolean;
    isClaimable?: boolean;
    result?: string;
    startsAt?: string;
    claimReward: () => void;
};

const MatchStatus: React.FC<MatchStatusProps> = ({
    isResolved,
    isLive,
    isCanceled,
    isClaimable,
    result,
    startsAt,
    claimReward,
}) => {
    const { t } = useTranslation();

    const canceledFlag = isCanceled && !isResolved;
    const regularFlag = !isResolved && !isCanceled && !isLive && !isClaimable;
    const isPending = isLive && !isResolved && !isCanceled && !isClaimable;

    return (
        <Container>
            {canceledFlag && <Status color={STATUS_COLOR.CANCELED}>{t('markets.market-card.canceled')}</Status>}
            {regularFlag && <MatchStarts>{`${t('markets.market-card.starts')}: ${startsAt}`}</MatchStarts>}
            {isResolved && !isClaimable && (
                <>
                    <ResultLabel>{t('markets.market-card.result')}</ResultLabel>
                    <Result isLive={isLive}>{result}</Result>
                    <Status color={STATUS_COLOR.FINISHED}>{t('markets.market-card.finished')}</Status>
                </>
            )}
            {isResolved && isClaimable && (
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
                    <ResultLabel>{t('markets.market-card.result')}</ResultLabel>
                    <Result isLive={isLive}>{result}</Result>
                    <Status color={STATUS_COLOR.CLAIMABLE} style={{ fontWeight: '700' }}>
                        {t('markets.market-card.finished')}
                    </Status>
                </>
            )}
            {isPending && (
                <>
                    {/* <Result isLive={isLive}>{result}</Result> */}
                    <Status color={STATUS_COLOR.STARTED} style={{ fontWeight: '500' }}>
                        {t('markets.market-card.pending-resolution')}
                    </Status>
                </>
            )}
            {!regularFlag && <MatchStarts>{`| ${startsAt}`}</MatchStarts>}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    margin-left: auto;
`;

export const Status = styled.span<{ color?: string }>`
    text-transform: uppercase;
    color: ${(_props) => (_props?.color ? _props.color : '')};
`;

const Result = styled.span<{ isLive?: boolean }>`
    font-size: ${(_props) => (_props?.isLive ? '16px' : '20px')};
    font-weight: ${(_props) => (_props?.isLive ? '400' : '700')};
    margin-right: ${(_props) => (_props?.isLive ? '7px' : '50px')};
`;

const ResultLabel = styled.span`
    font-weight: 300;
    font-size: 15px;
    margin-right: 2px;
`;

const MatchStarts = styled.span`
    justify-self: end;
    text-align: right;
    color: #ffffff;
    text-transform: uppercase;
    margin-left: 5px;
`;

const ClaimButton = styled(Button)<{ claimable?: boolean }>`
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    margin-right: 20px;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 5px;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.025em;
    visibility: ${(props) => (!props.claimable ? 'hidden' : '')};
`;

export default MatchStatus;
