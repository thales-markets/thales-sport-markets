import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useUsersStatsV2Query from 'queries/wallet/useUsersStatsV2Query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { formatCurrencyWithSign } from 'thales-utils';
import { Coins } from 'types/tokens';
import { COLLATERAL_ICONS_CLASS_NAMES, USD_SIGN } from '../../../../constants/currency';
import { FlexDivColumn, FlexDivRow } from '../../../../styles/common';

const UserStats: React.FC = () => {
    const { t } = useTranslation();
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const userStatsQuery = useUsersStatsV2Query(walletAddress.toLowerCase(), networkId, { enabled: isWalletConnected });
    const userStats = userStatsQuery.isSuccess && userStatsQuery.data ? userStatsQuery.data : undefined;

    const freeBetBalancesQuery = useFreeBetCollateralBalanceQuery(walletAddress?.toLowerCase(), networkId, {
        enabled: isWalletConnected,
    });
    const freeBetBalances =
        freeBetBalancesQuery.isSuccess && freeBetBalancesQuery.data ? freeBetBalancesQuery.data : undefined;

    const isFreeBetExists = freeBetBalances && !!Object.values(freeBetBalances).find((balance) => !!balance);

    return (
        <Wrapper>
            <SectionWrapper>
                <Header>
                    <ProfileIcon className="icon icon--profile3" />
                    {t('profile.stats.profile-data')}
                </Header>
                <Section>
                    <Label>{t('profile.stats.total-volume')}</Label>
                    <Value>{!userStats ? '-' : formatCurrencyWithSign(USD_SIGN, userStats.volume)}</Value>
                </Section>
                <Section>
                    <Label>{t('profile.stats.trades')}</Label>
                    <Value>{!userStats ? '-' : userStats.trades}</Value>
                </Section>
                <Section>
                    <Label>{t('profile.stats.highest-win')}</Label>
                    <Value>{!userStats ? '-' : formatCurrencyWithSign(USD_SIGN, userStats.highestWin)}</Value>
                </Section>
                <Section>
                    <Label>{t('profile.stats.lifetime-wins')}</Label>
                    <Value>{!userStats ? '-' : userStats.lifetimeWins}</Value>
                </Section>
            </SectionWrapper>
            {isFreeBetExists && (
                <SectionWrapper>
                    <SubHeader>
                        <SubHeaderIcon className="icon icon--gift" />
                        {t('profile.stats.free-bet')}
                    </SubHeader>
                    {freeBetBalances &&
                        Object.keys(freeBetBalances).map((currencyKey) => {
                            return freeBetBalances[currencyKey] ? (
                                <Section>
                                    <SubLabel>
                                        <CurrencyIcon className={COLLATERAL_ICONS_CLASS_NAMES[currencyKey as Coins]} />
                                        {currencyKey}
                                    </SubLabel>
                                    <SubValue>
                                        {formatCurrencyWithSign(currencyKey, freeBetBalances[currencyKey])}
                                    </SubValue>
                                </Section>
                            ) : (
                                <></>
                            );
                        })}
                </SectionWrapper>
            )}
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

const SubLabel = styled(Label)`
    color: ${(props) => props.theme.textColor.octonary};
`;

const Value = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.status.win};
    margin-left: auto;
`;

const SubValue = styled(Value)`
    color: ${(props) => props.theme.textColor.octonary};
`;

const ProfileIcon = styled.i`
    font-size: 20px;
    margin-right: 4px;
    font-weight: 400;
    text-transform: none;
    color: ${(props) => props.theme.textColor.septenary};
`;

const SubHeaderIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.textColor.octonary};
    margin-right: 4px;
    font-weight: 400;
    text-transform: none;
`;

const SubHeader = styled(Header)`
    color: ${(props) => props.theme.textColor.octonary};
    &::after,
    &:before {
        display: inline-block;
        content: '';
        border-top: 2px solid ${(props) => props.theme.borderColor.senary};
        width: 30%;
        margin-top: 30px;
        margin-left: 5px;
        margin-right: 5px;
        transform: translateY(-1rem);
    }
`;

const CurrencyIcon = styled.i`
    font-size: 20px !important;
    margin: 0px 3px;
    font-weight: 400 !important;
    text-transform: none !important;
    color: ${(props) => props.theme.textColor.octonary};
`;

const SectionWrapper = styled.div`
    width: 100%;
`;

export default UserStats;
