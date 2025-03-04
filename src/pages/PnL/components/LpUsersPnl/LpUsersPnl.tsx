import { USD_SIGN } from 'constants/currency';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { League } from 'enums/sports';
import { t } from 'i18next';
import useLpUsersPnlQuery from 'queries/pnl/useLpUsersPnlQuery';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { useChainId, useClient } from 'wagmi';

type LpUsersPnlProps = {
    lpCollateral: LiquidityPoolCollateral;
    round: number;
    leagueId: League;
    onlyPP: boolean;
};

const LpUsersPnl: React.FC<LpUsersPnlProps> = ({ lpCollateral, round, leagueId, onlyPP }) => {
    const networkId = useChainId();
    const client = useClient();

    const lpUsersPnlQuery = useLpUsersPnlQuery(lpCollateral, round, leagueId, onlyPP, { networkId, client });
    const lpUsersPnl = lpUsersPnlQuery.isSuccess && lpUsersPnlQuery.data ? lpUsersPnlQuery.data : [];

    return (
        <Wrapper>
            <SectionWrapper>
                <SubHeaderWrapper>
                    <SubHeader>
                        <SubHeaderIcon className="icon icon--profile" />
                        {t('liquidity-pool.pnl.users-pnl')}
                    </SubHeader>
                </SubHeaderWrapper>
                {lpUsersPnl.map((lpUserPnl) => {
                    return (
                        <Section key={lpUserPnl.account}>
                            <Label>{lpUserPnl.account}</Label>
                            <Value>{`${formatCurrencyWithKey(
                                lpCollateral === 'cbbtc'
                                    ? 'cbBTC'
                                    : lpCollateral === 'wbtc'
                                    ? 'wBTC'
                                    : lpCollateral.toUpperCase(),
                                lpUserPnl.pnl,
                                2
                            )} (${formatCurrencyWithSign(USD_SIGN, lpUserPnl.pnlInUsd, 2)})`}</Value>
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

const SectionWrapper = styled.div`
    width: 100%;
`;

export default LpUsersPnl;
