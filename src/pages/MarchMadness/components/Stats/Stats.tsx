import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import { minutesToMilliseconds } from 'date-fns';
import useMarchMadnessStatsQuery from 'queries/marchMadness/useMarchMadnessStatsQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
import { useChainId, useClient } from 'wagmi';

const Stats: React.FC<{ disableMobileView?: boolean }> = ({ disableMobileView }) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();

    const marchMadnessStatsQuery = useMarchMadnessStatsQuery(
        { networkId, client },
        { enabled: isMarchMadnessAvailableForNetworkId(networkId), refetchInterval: minutesToMilliseconds(1) }
    );
    const marchMadnessStatsData =
        marchMadnessStatsQuery.isSuccess && marchMadnessStatsQuery.data
            ? marchMadnessStatsQuery.data
            : {
                  totalBracketsMinted: 0,
                  poolSize: 0,
              };

    return (
        <Container>
            <Label disableMobileView={disableMobileView}>
                <Icon className={'icon icon--stats'} />
                <Text fontWeight={600}>{t('march-madness.stats.live-stats')}</Text>
            </Label>
            <Data disableMobileView={disableMobileView}>
                <Pair>
                    <Text>{t('march-madness.stats.brackets-minted')}:</Text>
                    <Value>{marchMadnessStatsData.totalBracketsMinted}</Value>
                </Pair>
                <Separator disableMobileView={disableMobileView} />
                <Pair>
                    <Text>{t('march-madness.stats.pool-size')}:</Text>
                    <Value>{`${formatCurrencyWithSign(
                        USD_SIGN,
                        marchMadnessStatsData.poolSize
                    )} + ${formatCurrencyWithKey(
                        CRYPTO_CURRENCY_MAP.OVER,
                        2 * marchMadnessStatsData.poolSize
                    )}`}</Value>
                </Pair>
            </Data>
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    width: 100%;
    height: 37px;
    background: ${(props) => props.theme.marchMadness.background.senary};
    border-radius: 8px;
    margin-bottom: 12px;
`;

const Data = styled(FlexDivCentered)<{ disableMobileView?: boolean }>`
    @media (max-width: ${(props) => (props.disableMobileView ? '0px' : '575px')}) {
        flex-direction: column;
        gap: 3px;
    }
`;

const Pair = styled(FlexDivRowCentered)`
    align-items: baseline;
`;

const Label = styled(Data)<{ disableMobileView?: boolean }>`
    margin: 0 250px 0 -250px;
    @media (max-width: ${(props) => (props.disableMobileView ? '0px' : '575px')}) {
        display: none;
    }
`;

const Text = styled.span<{ fontWeight?: number }>`
    font-family: ${(props) =>
        props.fontWeight && props.fontWeight > 500 ? props.theme.fontFamily.primary : props.theme.fontFamily.secondary};
    font-size: 16px;
    line-height: 10px;
    text-transform: uppercase;
`;

const Value = styled.span`
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 16px;
    line-height: 14px;
    text-transform: uppercase;
    margin-left: 5px;
`;

const Icon = styled.i`
    margin-right: 5px;
`;

const Separator = styled.div<{ disableMobileView?: boolean }>`
    border-left: 2px solid ${(props) => props.theme.marchMadness.borderColor.tertiary};
    height: 26px;
    margin: 0 30px;
    @media (max-width: ${(props) => (props.disableMobileView ? '0px' : '575px')}) {
        display: none;
    }
`;

export default Stats;
