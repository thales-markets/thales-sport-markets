import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type MatchStatusProps = {
    isResolved: boolean;
    isLive?: boolean;
    isCanceled?: boolean;
    result?: string;
    startsAt?: string;
    isPaused: boolean;
    isMobile?: boolean;
};

const MatchStatus: React.FC<MatchStatusProps> = ({
    isResolved,
    isLive,
    isCanceled,
    result,
    startsAt,
    isPaused,
    isMobile,
}) => {
    const { t } = useTranslation();

    const regularFlag = !isResolved && !isCanceled && !isLive;
    const isPending = isLive && !isResolved && !isCanceled;

    return (
        <Container resolved={isResolved && !isCanceled} paused={isPaused} mobile={isMobile}>
            {isPaused && !isResolved && !isPending ? (
                <>
                    <Status color={STATUS_COLOR.PAUSED}>{t('markets.market-card.paused')}</Status>
                    {!isMobile && <MatchStarts>{`${startsAt}`}</MatchStarts>}
                </>
            ) : (
                <>
                    {isCanceled && <Status color={STATUS_COLOR.CANCELED}>{t('markets.market-card.canceled')}</Status>}
                    {regularFlag && !isMobile && <MatchStarts>{`${startsAt}`}</MatchStarts>}
                    {isResolved && !isCanceled && isMobile && (
                        <>
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
                    {!regularFlag && !isMobile && <MatchStarts>{`${startsAt}`}</MatchStarts>}
                </>
            )}
        </Container>
    );
};

const Container = styled.div<{ resolved?: boolean; paused?: boolean; mobile?: boolean }>`
    display: flex;
    flex-direction: ${(_props) => (_props?.mobile && _props?.resolved ? 'column' : 'row')};
    align-items: ${(_props) => (_props?.mobile && _props?.resolved ? 'baseline' : 'center')};
    justify-content: ${(_props) =>
        _props?.mobile && _props?.paused ? 'center' : _props?.mobile && _props?.resolved ? 'space-evenly' : 'start'};
    margin-right: ${(_props) => (_props?.mobile && _props?.resolved ? '' : '15px')};
    width: ${(_props) => (_props?.resolved ? '33%' : '')};
    height: ${(_props) => (_props?.mobile ? '40px' : '')};
`;

export const Status = styled.span<{ color?: string }>`
    font-size: 12px;
    text-transform: uppercase;
    color: ${(_props) => (_props?.color ? _props.color : '')};
    align-self: center;
    justify-content: space-evenly;
`;

export const Result = styled.span<{ isLive?: boolean }>`
    font-size: ${(_props) => (_props?.isLive ? '12px' : '12px')};
    font-weight: ${(_props) => (_props?.isLive ? '400' : '700')};
    // margin-right: ${(_props) => (_props?.isLive ? '7px' : '50px')};
`;

export const ResultLabel = styled.span`
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

export default MatchStatus;
