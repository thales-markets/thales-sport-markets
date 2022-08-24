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
};

const MatchStatus: React.FC<MatchStatusProps> = ({ isResolved, isLive, isCanceled, isClaimable, result, startsAt }) => {
    const { t } = useTranslation();

    const canceledFlag = isCanceled && !isResolved;
    const regularFlag = !isResolved && !isCanceled && !isLive && !isClaimable;
    const isPending = isLive && !isResolved && !isCanceled && !isClaimable;

    return (
        <Container>
            {canceledFlag && <Status color={STATUS_COLOR.CANCELED}>{t('markets.market-card-list.canceled')}</Status>}
            {regularFlag && <MatchStarts>{`${t('markets.market-card-list.starts')}: ${startsAt}`}</MatchStarts>}
            {isResolved && !isClaimable && (
                <>
                    <ResultLabel>{t('markets.market-card-list.result')}</ResultLabel>
                    <Result isLive={isLive}>{result}</Result>
                    <Status color={STATUS_COLOR.FINISHED}>{t('markets.market-card-list.finished')}</Status>
                </>
            )}
            {isResolved && isClaimable && (
                <>
                    <ClaimButton>{t('markets.market-card-list.claim')}</ClaimButton>
                    <ResultLabel>{t('markets.market-card-list.result')}</ResultLabel>
                    <Result isLive={isLive}>{result}</Result>
                    <Status color={STATUS_COLOR.CLAIMABLE} style={{ fontWeight: '700' }}>
                        {t('markets.market-card-list.claimable')}
                    </Status>
                </>
            )}
            {isPending && (
                <>
                    {/* <Result isLive={isLive}>{result}</Result> */}
                    <Status color={STATUS_COLOR.STARTED} style={{ fontWeight: '500' }}>
                        {t('markets.market-card-list.pending-resolution')}
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
    font-size: ${(_props) => (_props?.isLive ? '17px' : '20px')};
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

const ClaimButton = styled.div`
    margin-right: 20px;
    text-transform: uppercase;
    padding: 4px 11px;
    background-color: #3fd1ff;
    cursor: pointer;
    color: #303656;
    border-radius: 5px;
`;

export default MatchStatus;
