// @ts-ignore
import React from 'react';
import disclaimer from 'assets/docs/overtime-markets-disclaimer.pdf';
import termsOfUse from 'assets/docs/thales-terms-of-use.pdf';
import { DisclaimerComponent } from '@rainbow-me/rainbowkit';
import { Trans } from 'react-i18next';

const WalletDisclaimer: DisclaimerComponent = ({ Text, Link }) => {
    return (
        <Text>
            <Trans
                i18nKey="common.wallet.disclaimer"
                components={{
                    disclaimer: (
                        <Link href={disclaimer}>
                            <></>
                        </Link>
                    ),
                    terms: (
                        <Link href={termsOfUse}>
                            <></>
                        </Link>
                    ),
                }}
            />
        </Text>
    );
};

export default WalletDisclaimer;
