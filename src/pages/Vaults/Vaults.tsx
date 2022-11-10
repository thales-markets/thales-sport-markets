import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref, buildVaultLink } from 'utils/routes';
import {
    Container,
    Title,
    Wrapper,
    VaultContainer,
    SpaContainer,
    VaultTitle,
    VaultSectionTitle,
    VaultSectionDescription,
} from './styled-components';
import SPAAnchor from 'components/SPAAnchor';
import { Info } from 'pages/Markets/Home/Home';
import i18n from 'i18n';
import { VAULT_MAP } from 'constants/vault';
import { RootState } from 'redux/rootReducer';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { getIsAppReady } from 'redux/modules/app';
import useVaultDataQuery from 'queries/vault/useVaultDataQuery';
import { VaultData } from 'types/vault';
import { formatPercentage } from 'utils/formatters/number';

const Vault: React.FC = () => {
    const { t } = useTranslation();
    const language = i18n.language;
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const discountVaultAddress = !!VAULT_MAP['discount-vault']
        ? VAULT_MAP['discount-vault'].addresses[networkId]
        : undefined;
    const degenDiscountVaultAddress = !!VAULT_MAP['degen-discount-vault']
        ? VAULT_MAP['degen-discount-vault'].addresses[networkId]
        : undefined;
    const safuDiscountVaultAddress = !!VAULT_MAP['safu-discount-vault']
        ? VAULT_MAP['safu-discount-vault'].addresses[networkId]
        : undefined;

    const discountVaultDataQuery = useVaultDataQuery(discountVaultAddress, networkId, {
        enabled: isAppReady && !!discountVaultAddress,
    });
    const discountVaultData: VaultData | undefined = useMemo(() => {
        if (discountVaultDataQuery.isSuccess && discountVaultDataQuery.data) {
            return discountVaultDataQuery.data;
        }
        return undefined;
    }, [discountVaultDataQuery.isSuccess, discountVaultDataQuery.data]);

    const degenDiscountVaultDataQuery = useVaultDataQuery(degenDiscountVaultAddress, networkId, {
        enabled: isAppReady && !!degenDiscountVaultAddress,
    });
    const degenDiscountVaultData: VaultData | undefined = useMemo(() => {
        if (degenDiscountVaultDataQuery.isSuccess && degenDiscountVaultDataQuery.data) {
            return degenDiscountVaultDataQuery.data;
        }
        return undefined;
    }, [degenDiscountVaultDataQuery.isSuccess, degenDiscountVaultDataQuery.data]);

    const safuDiscountVaultDataQuery = useVaultDataQuery(safuDiscountVaultAddress, networkId, {
        enabled: isAppReady && !!safuDiscountVaultAddress,
    });
    const safuDiscountVaultData: VaultData | undefined = useMemo(() => {
        if (safuDiscountVaultDataQuery.isSuccess && safuDiscountVaultDataQuery.data) {
            return safuDiscountVaultDataQuery.data;
        }
        return undefined;
    }, [safuDiscountVaultDataQuery.isSuccess, safuDiscountVaultDataQuery.data]);

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
                <SpaContainer>
                    <SPAAnchor href={buildVaultLink('discount-vault', language)}>
                        <VaultContainer>
                            <VaultTitle>{t(`vault.discount-vault.title`)}</VaultTitle>
                            <VaultSectionTitle>Vault Strategy</VaultSectionTitle>
                            <VaultSectionDescription>
                                {discountVaultData && (
                                    <Trans
                                        i18nKey={`vault.discount-vault.description`}
                                        components={{
                                            p: <p />,
                                        }}
                                        values={{
                                            odds: formatPercentage(discountVaultData.priceLowerLimit, 0),
                                            discount: formatPercentage(Math.abs(discountVaultData.skewImpactLimit), 0),
                                        }}
                                    />
                                )}
                            </VaultSectionDescription>
                            <VaultSectionTitle>Vault Risks</VaultSectionTitle>
                            <VaultSectionDescription>
                                Mauris a nisl mollis, auctor dolor ac, mollis arcu. Sed convallis, erat in sollicitudin
                                tempor, nisi odio blandit leo, eu posuere massa massa eu ex. Cras et leo sit amet enim
                                faucibus accumsan vitae sit amet dui. Praesent condimentum, massa a feugiat feugiat,
                                libero metus eleifend turpis.
                            </VaultSectionDescription>
                        </VaultContainer>
                    </SPAAnchor>
                </SpaContainer>
                <SpaContainer>
                    <SPAAnchor href={buildVaultLink('degen-discount-vault', language)}>
                        <VaultContainer>
                            <VaultTitle>{t(`vault.degen-discount-vault.title`)}</VaultTitle>
                            <VaultSectionTitle>Vault Strategy</VaultSectionTitle>
                            <VaultSectionDescription>
                                {degenDiscountVaultData && (
                                    <Trans
                                        i18nKey={`vault.degen-discount-vault.description`}
                                        components={{
                                            p: <p />,
                                        }}
                                        values={{
                                            odds: formatPercentage(degenDiscountVaultData.priceLowerLimit, 0),
                                            discount: formatPercentage(
                                                Math.abs(degenDiscountVaultData.skewImpactLimit),
                                                0
                                            ),
                                        }}
                                    />
                                )}
                            </VaultSectionDescription>
                            <VaultSectionTitle>Vault Risks</VaultSectionTitle>
                            <VaultSectionDescription>
                                Mauris a nisl mollis, auctor dolor ac, mollis arcu. Sed convallis, erat in sollicitudin
                                tempor, nisi odio blandit leo, eu posuere massa massa eu ex. Cras et leo sit amet enim
                                faucibus accumsan vitae sit amet dui. Praesent condimentum, massa a feugiat feugiat,
                                libero metus eleifend turpis.
                            </VaultSectionDescription>
                        </VaultContainer>
                    </SPAAnchor>
                </SpaContainer>
                <SpaContainer>
                    <SPAAnchor href={buildVaultLink('safu-discount-vault', language)}>
                        <VaultContainer>
                            <VaultTitle>{t(`vault.safu-discount-vault.title`)}</VaultTitle>
                            <VaultSectionTitle>Vault Strategy</VaultSectionTitle>
                            <VaultSectionDescription>
                                {safuDiscountVaultData && (
                                    <Trans
                                        i18nKey={`vault.safu-discount-vault.description`}
                                        components={{
                                            p: <p />,
                                        }}
                                        values={{
                                            odds: formatPercentage(safuDiscountVaultData.priceLowerLimit, 0),
                                            discount: formatPercentage(
                                                Math.abs(safuDiscountVaultData.skewImpactLimit),
                                                0
                                            ),
                                        }}
                                    />
                                )}
                            </VaultSectionDescription>
                            <VaultSectionTitle>Vault Risks</VaultSectionTitle>
                            <VaultSectionDescription>
                                Mauris a nisl mollis, auctor dolor ac, mollis arcu. Sed convallis, erat in sollicitudin
                                tempor, nisi odio blandit leo, eu posuere massa massa eu ex. Cras et leo sit amet enim
                                faucibus accumsan vitae sit amet dui. Praesent condimentum, massa a feugiat feugiat,
                                libero metus eleifend turpis.
                            </VaultSectionDescription>
                        </VaultContainer>
                    </SPAAnchor>
                </SpaContainer>
            </Container>
        </Wrapper>
    );
};

export default Vault;
