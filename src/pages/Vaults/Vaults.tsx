import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import { Container, Note, Title, Wrapper } from './styled-components';
import VaultOverview from './VaultOverview';

const Vault: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <Title>{t('vaults.title')}</Title>
            <Note>
                <Trans
                    i18nKey={`vault.gamified-staking-message`}
                    components={{
                        p: <p />,
                    }}
                />
            </Note>
            <Container>
                <VaultOverview vaultId="discount-vault" />
                <VaultOverview vaultId="degen-discount-vault" />
                <VaultOverview vaultId="safu-discount-vault" />
            </Container>
            <Container>
                <VaultOverview vaultId="upsettoor-vault" />
                <VaultOverview vaultId="parlay-discount-vault" />
            </Container>
        </Wrapper>
    );
};

export default Vault;
