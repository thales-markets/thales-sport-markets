// @ts-ignore
import React from 'react';
import disclaimer from 'assets/docs/overtime-markets-disclaimer.pdf';
import { DisclaimerComponent } from '@rainbow-me/rainbowkit';
import { useTranslation } from 'react-i18next';

const WalletDisclaimer: DisclaimerComponent = ({ Text, Link }) => {
    const { t } = useTranslation();

    return (
        <Text>
            {t('common.wallet.disclaimer1')} <Link href={disclaimer}>{t('common.wallet.disclaimer-lowercase')}</Link>{' '}
            {t('common.wallet.disclaimer2')}
        </Text>
    );
};

export default WalletDisclaimer;
