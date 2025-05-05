import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import { getLeagueLabel, League } from 'overtime-utils';
import useLpPpStatsByLeagueQuery from 'queries/pnl/useLpPpStatsByLeagueQuery';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { Coins, formatCurrencyWithSign } from 'thales-utils';
import { useChainId, useClient } from 'wagmi';

type LpStatsProps = {
    round: number;
    leagueId: League;
    onlyPP: boolean;
};

const LpStats: React.FC<LpStatsProps> = ({ round, leagueId, onlyPP }) => {
    const networkId = useChainId();
    const client = useClient();

    const lpStatsQuery = useLpPpStatsByLeagueQuery(round, leagueId, onlyPP, { networkId, client });
    const lpStats = lpStatsQuery.isSuccess && lpStatsQuery.data ? lpStatsQuery.data : {};

    return (
        <Wrapper>
            <SectionWrapper>
                <SubHeaderWrapper>
                    <SubHeader>
                        <SubHeaderIcon className="icon icon--yield" />
                        {t('liquidity-pool.pnl.lp-pnl')}
                    </SubHeader>
                </SubHeaderWrapper>
                {Object.keys(lpStats)
                    .sort((keyA: string, keyB: string) => {
                        const statsA = lpStats[Number(keyA)];
                        const statsB = lpStats[Number(keyB)];
                        return statsA[statsA.length - 1].pnlInUsd > statsB[statsB.length - 1].pnlInUsd ? 1 : -1;
                    })
                    .map((key: string, index: number) => {
                        const league = Number(key);
                        const stats = lpStats[league][lpStats[league].length - 1];
                        const statsName = getLeagueLabel(league);
                        return (
                            <Section key={`${statsName}-${index}-${networkId}-lp-by-league`}>
                                <Label>
                                    <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[statsName as Coins]} />{' '}
                                    {statsName}
                                </Label>
                                <Value>{formatCurrencyWithSign(USD_SIGN, stats.pnlInUsd, 2)}</Value>
                            </Section>
                        );
                    })}
            </SectionWrapper>
            <SectionWrapper>
                <SubHeaderWrapper>
                    <SubHeader>
                        <SubHeaderIcon className="icon icon--yield" />
                        {t('liquidity-pool.pnl.fees')}
                    </SubHeader>
                </SubHeaderWrapper>
                {Object.keys(lpStats)
                    .sort((keyA: string, keyB: string) => {
                        const statsA = lpStats[Number(keyA)];
                        const statsB = lpStats[Number(keyB)];
                        return statsA[statsA.length - 1].feesInUsd < statsB[statsB.length - 1].feesInUsd ? 1 : -1;
                    })
                    .map((key: string, index: number) => {
                        const league = Number(key);
                        const stats = lpStats[league][lpStats[league].length - 1];
                        const statsName = getLeagueLabel(league);
                        return (
                            <Section key={`${statsName}-${index}-${networkId}-fees-by-league`}>
                                <Label>
                                    <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[statsName as Coins]} />{' '}
                                    {statsName}
                                </Label>
                                <Value>{formatCurrencyWithSign(USD_SIGN, stats.feesInUsd, 2)}</Value>
                            </Section>
                        );
                    })}
            </SectionWrapper>
            <SectionWrapper>
                <SubHeaderWrapper>
                    <SubHeader>
                        <SubHeaderIcon className="icon icon--yield" />
                        {t('liquidity-pool.pnl.users-pnl')}
                    </SubHeader>
                </SubHeaderWrapper>
                {Object.keys(lpStats)
                    .sort((keyA: string, keyB: string) => {
                        const statsA = lpStats[Number(keyA)];
                        const statsB = lpStats[Number(keyB)];
                        return -statsA[statsA.length - 1].feesInUsd - statsA[statsA.length - 1].pnlInUsd <
                            -statsB[statsB.length - 1].feesInUsd - statsB[statsB.length - 1].pnlInUsd
                            ? 1
                            : -1;
                    })
                    .map((key: string, index: number) => {
                        const league = Number(key);
                        const stats = lpStats[league][lpStats[league].length - 1];
                        const statsName = getLeagueLabel(league);

                        return (
                            <Section key={`${statsName}-${index}-${networkId}-user-by-league`}>
                                <Label>
                                    <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[statsName as Coins]} />{' '}
                                    {statsName}
                                </Label>
                                <Value>{formatCurrencyWithSign(USD_SIGN, -stats.feesInUsd - stats.pnlInUsd, 2)}</Value>
                            </Section>
                        );
                    })}
            </SectionWrapper>
        </Wrapper>
    );
};

const Header = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 14px;
    color: ${(props) => props.theme.textColor.septenary};
    text-transform: uppercase;
    padding: 15px 0;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.quinary};
    border-radius: 5px;
    width: 100%;
    padding: 10px 15px 20px 15px;
    gap: 4px;
    flex: initial;
`;

const Section = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const Label = styled.span`
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.textColor.quaternary};
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

const Value = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.status.win};
    margin-left: auto;
`;

const SubHeaderIcon = styled.i`
    font-size: 20px;
    margin-right: 4px;
    font-weight: 400;
    text-transform: none;
`;

const SubHeaderWrapper = styled(FlexDivRow)`
    &::after,
    &:before {
        display: inline-block;
        content: '';
        border-top: 2px solid ${(props) => props.theme.borderColor.senary};
        width: 100%;
        margin-top: 40px;
        transform: translateY(-1rem);
    }
`;

const SubHeader = styled(Header)`
    width: 300px;
`;

const CurrencyIcon = styled.i`
    font-size: 20px !important;
    margin: 0 3px 3px 3px;
    font-weight: 400 !important;
    text-transform: none !important;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const SectionWrapper = styled.div`
    width: 100%;
`;

export default LpStats;
