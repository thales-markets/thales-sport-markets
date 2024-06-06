import ReferralButton from 'components/ReferralButton';
import { USD_SIGN } from 'constants/currency';
import useReferralTransactionsQuery from 'queries/referral/useReferralTransactionsQuery';
import useReferredTradersQuery from 'queries/referral/useReferredTradersQuery';
import useReferrerOverviewQuery from 'queries/referral/useReferrerOverviewQuery';
import useReferrersQuery from 'queries/referral/useReferrersQuery';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrencyWithSign } from 'thales-utils';
import { getDefaultCollateral } from 'utils/collaterals';
import AffiliateLeaderboard from './components/AffiliateLeaderboard';
import ReferralTransactionsTable from './components/ReferralTransactionsTable';
import TradersTable from './components/TradersTable';
import {
    ButtonContainer,
    InfoContainer,
    KeyValueContainer,
    Label,
    MainInfoContainer,
    Paragraph,
    ParagraphContainer,
    ParagraphHeader,
    Tab,
    TableContainer,
    TabsContainer,
    Value,
    Wrapper,
} from './styled-components';

const NavigationItems = [
    {
        index: 0,
        i18label: 'referral.nav-items.all-transactions',
    },
    {
        index: 1,
        i18label: 'referral.nav-items.see-result-by-trader',
    },
    {
        index: 2,
        i18label: 'referral.nav-items.affiliate-leaderboard',
    },
];

const Referral: React.FC = () => {
    const { t } = useTranslation();

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state))?.toLowerCase() || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const [selectedTab, setSelectedTab] = useState<number>(0);

    const referrerOverviewQuery = useReferrerOverviewQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });

    const referrersQuery = useReferrersQuery(networkId, 'totalVolume', 'desc', {
        enabled: isWalletConnected,
    });

    const referredTradersQuery = useReferredTradersQuery(networkId, walletAddress, undefined, undefined, {
        enabled: isWalletConnected,
    });

    const referralTransactionsQuery = useReferralTransactionsQuery(networkId, walletAddress, {
        enabled: isWalletConnected,
    });

    const referrerOverviewData =
        referrerOverviewQuery?.isSuccess && referrerOverviewQuery?.data
            ? referrerOverviewQuery.data
            : { trades: 0, totalVolume: 0, totalEarned: 0 };
    const referrersData = referrersQuery?.isSuccess && referrersQuery.data ? referrersQuery.data : [];
    const referredTradesData =
        referredTradersQuery?.isSuccess && referredTradersQuery.data ? referredTradersQuery.data : [];
    const referralTransactionsData =
        referralTransactionsQuery?.isSuccess && referralTransactionsQuery.data ? referralTransactionsQuery.data : [];

    return (
        <Wrapper>
            <MainInfoContainer>
                <ButtonContainer>
                    <ReferralButton />
                </ButtonContainer>
                <InfoContainer>
                    <KeyValueContainer>
                        <Label>{t('referral.trades')}</Label>
                        <Value>{Number(referrerOverviewData?.trades)}</Value>
                    </KeyValueContainer>
                    <KeyValueContainer>
                        <Label>{t('referral.total-volume')}</Label>
                        <Value>{formatCurrencyWithSign(USD_SIGN, referrerOverviewData?.totalVolume, 2)}</Value>
                    </KeyValueContainer>
                    <KeyValueContainer>
                        <Label win={true}>{t('referral.total-earned')}</Label>
                        <Value win={true}>
                            {formatCurrencyWithSign(USD_SIGN, referrerOverviewData?.totalEarned, 2)}
                        </Value>
                    </KeyValueContainer>
                </InfoContainer>
            </MainInfoContainer>
            <ParagraphContainer>
                <ParagraphHeader>{t('referral.header')}</ParagraphHeader>
                <Paragraph>
                    <Trans
                        i18nKey={'referral.paragraph'}
                        values={{ collateralKey: getDefaultCollateral(networkId) }}
                        components={{
                            bold: <strong style={{ fontWeight: '600' }} />,
                        }}
                    />
                </Paragraph>
            </ParagraphContainer>
            <TabsContainer>
                {NavigationItems.map((item, index) => {
                    return (
                        <Tab active={selectedTab == item.index} key={index} onClick={() => setSelectedTab(item.index)}>
                            {t(item.i18label)}
                        </Tab>
                    );
                })}
            </TabsContainer>
            <TableContainer>
                {selectedTab == NavigationItems[0].index && (
                    <ReferralTransactionsTable
                        isLoading={referralTransactionsQuery.isLoading}
                        transactions={referralTransactionsData}
                    />
                )}
                {selectedTab == NavigationItems[1].index && (
                    <TradersTable isLoading={referredTradersQuery.isLoading} referredTraders={referredTradesData} />
                )}
                {selectedTab == NavigationItems[2].index && (
                    <AffiliateLeaderboard isLoading={referrersQuery.isLoading} referrers={referrersData} />
                )}
            </TableContainer>
        </Wrapper>
    );
};

export default Referral;
