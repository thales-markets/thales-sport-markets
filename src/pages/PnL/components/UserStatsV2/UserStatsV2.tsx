import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from 'constants/currency';
import useLpStatsV2Query from 'queries/wallet/useLpStatsV2Query';
import React from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { Coins } from 'types/tokens';

const UserStats: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const lpStatsQuery = useLpStatsV2Query(networkId);
    const lpStats = lpStatsQuery.isSuccess && lpStatsQuery.data ? lpStatsQuery.data : [];

    return (
        <Wrapper>
            <SectionWrapper>
                <SubHeaderWrapper>
                    <SubHeader>
                        <SubHeaderIcon className="icon icon--yield" />
                        LP Stats
                    </SubHeader>
                </SubHeaderWrapper>
                {lpStats.map((stats, index) => {
                    return index === 3 ? (
                        <Section key={stats.name}>
                            <Label>
                                <CurrencyIcon className="icon icon--yield" />
                                {stats.name}
                            </Label>
                            <Value>{formatCurrencyWithSign(USD_SIGN, stats.pnlInUsd, 2)}</Value>
                        </Section>
                    ) : (
                        <Section key={stats.name}>
                            <Label>
                                <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[stats.name as Coins]} />{' '}
                                {stats.name}
                            </Label>
                            <Value>{`${formatCurrencyWithKey(stats.name, stats.pnl, 2)} (${formatCurrencyWithSign(
                                USD_SIGN,
                                stats.pnlInUsd,
                                2
                            )})`}</Value>
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
    text-transform: uppercase;
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

export default UserStats;
