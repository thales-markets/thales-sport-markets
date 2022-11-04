import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref, buildVaultLink } from 'utils/routes';
import { Container, Title, Wrapper, VaultContainer } from './styled-components';
import SPAAnchor from 'components/SPAAnchor';
import { Info } from 'pages/Markets/Home/Home';
import i18n from 'i18n';

const Vault: React.FC = () => {
    const { t } = useTranslation();
    const language = i18n.language;

    return (
        <Wrapper>
            <Info>
                <Trans
                    i18nKey="rewards.op-rewards-banner-message"
                    components={{
                        bold: <SPAAnchor href={buildHref(ROUTES.Rewards)} />,
                    }}
                />
            </Info>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <Title>{t('vaults.title')}</Title>
            <Container>
                <SPAAnchor href={buildVaultLink('discount-vault', language)}>
                    <VaultContainer>{t(`vault.discount-vault.title`)}</VaultContainer>
                </SPAAnchor>
                <SPAAnchor href={buildVaultLink('vault-x', language)}>
                    <VaultContainer>{t(`vault.vault-x.title`)}</VaultContainer>
                </SPAAnchor>
                <SPAAnchor href={buildVaultLink('vault-y', language)}>
                    <VaultContainer>{t(`vault.vault-y.title`)}</VaultContainer>
                </SPAAnchor>
            </Container>
        </Wrapper>
    );
};

export default Vault;
