import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import { Container, Title, Wrapper } from './styled-components';
import SPAAnchor from 'components/SPAAnchor';
import { Info } from 'pages/Markets/Home/Home';
import VaultOverview from './VaultOverview';
import { NetworkId } from 'types/network';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { NetworkIdByName } from 'utils/network';

const Vault: React.FC = () => {
    const { t } = useTranslation();
    const networkId: NetworkId = useSelector((rootState: RootState) => getNetworkId(rootState));

    return (
        <Wrapper>
            {networkId !== NetworkIdByName.ArbitrumOne && (
                <Info>
                    <Trans
                        i18nKey="rewards.op-rewards-banner-message"
                        components={{
                            bold: <SPAAnchor href={buildHref(ROUTES.Rewards)} />,
                        }}
                    />
                </Info>
            )}
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <Title>{t('vaults.title')}</Title>
            <Container>
                <VaultOverview vaultId="discount-vault" />
                <VaultOverview vaultId="degen-discount-vault" />
                <VaultOverview vaultId="safu-discount-vault" />
                <VaultOverview vaultId="parlay-discount-vault" />
            </Container>
        </Wrapper>
    );
};

export default Vault;
