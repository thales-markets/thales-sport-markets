import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { buildVaultLink } from 'utils/routes';
import {
    VaultContainer,
    SpaContainer,
    VaultTitle,
    VaultSectionTitle,
    VaultSectionDescription,
    LoaderContainer,
    VaultInfoContainer,
    VaultInfoLabel,
    VaultInfo,
    VaultBottomWrapper,
    VaultTopWrapper,
    TitleVaultIcon,
    VaultSectionIcon,
} from './styled-components';
import SPAAnchor from 'components/SPAAnchor';
import i18n from 'i18n';
import { VAULT_MAP } from 'constants/vault';
import { RootState } from 'redux/rootReducer';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { getIsAppReady } from 'redux/modules/app';
import useVaultDataQuery from 'queries/vault/useVaultDataQuery';
import { VaultData } from 'types/vault';
import { formatPercentage, formatPercentageWithSign } from 'utils/formatters/number';
import SimpleLoader from 'components/SimpleLoader';
import TimeRemaining from 'components/TimeRemaining';
import { Colors, FlexDivColumn } from 'styles/common';

type VaultOverviewProps = {
    vaultId: string;
};

const VaultOverview: React.FC<VaultOverviewProps> = ({ vaultId }) => {
    const { t } = useTranslation();
    const language = i18n.language;
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [lastValidVaultData, setLastValidVaultData] = useState<VaultData | undefined>(undefined);

    const vaultAddress = !!VAULT_MAP[vaultId] ? VAULT_MAP[vaultId].addresses[networkId] : undefined;

    const vaultDataQuery = useVaultDataQuery(vaultAddress, networkId, {
        enabled: isAppReady && !!vaultAddress,
    });

    useEffect(() => {
        if (vaultDataQuery.isSuccess && vaultDataQuery.data) {
            setLastValidVaultData(vaultDataQuery.data);
        }
    }, [vaultDataQuery.isSuccess, vaultDataQuery.data]);

    const vaultData: VaultData | undefined = useMemo(() => {
        if (vaultDataQuery.isSuccess && vaultDataQuery.data) {
            return vaultDataQuery.data;
        }
        return lastValidVaultData;
    }, [vaultDataQuery.isSuccess, vaultDataQuery.data, lastValidVaultData]);

    return (
        <SpaContainer>
            <SPAAnchor href={buildVaultLink(vaultId, language)}>
                <FlexDivColumn style={{ height: '100%' }}>
                    <VaultContainer>
                        <VaultTitle>
                            <TitleVaultIcon className={`icon icon--${vaultId}`} />
                            {t(`vault.${vaultId}.title`)}
                        </VaultTitle>
                        {!vaultData ? (
                            <LoaderContainer>
                                <SimpleLoader />
                            </LoaderContainer>
                        ) : (
                            <FlexDivColumn>
                                <VaultTopWrapper>
                                    <VaultSectionTitle>
                                        <VaultSectionIcon className={`icon icon--strategy`} />
                                        {t('vaults.strategy-label')}
                                    </VaultSectionTitle>
                                    <VaultSectionDescription>
                                        <Trans
                                            i18nKey={`vault.${vaultId}.description`}
                                            components={{
                                                p: <p />,
                                            }}
                                            values={{
                                                odds: formatPercentage(vaultData.priceLowerLimit, 0),
                                                discount: formatPercentage(Math.abs(vaultData.skewImpactLimit), 0),
                                            }}
                                        />
                                    </VaultSectionDescription>
                                    <VaultSectionTitle>
                                        <VaultSectionIcon className={`icon icon--risks`} />
                                        {t('vaults.risks-label')}
                                    </VaultSectionTitle>
                                    <VaultSectionDescription>
                                        <Trans
                                            i18nKey={`vault.${vaultId}.risks`}
                                            components={{
                                                p: <p />,
                                            }}
                                            values={{
                                                utilizationRate: formatPercentage(vaultData.utilizationRate, 0),
                                                allocationLimitsPerMarketPerRound: formatPercentage(
                                                    vaultData.allocationLimitsPerMarketPerRound
                                                ),
                                                odds: formatPercentage(vaultData.priceLowerLimit, 0),
                                            }}
                                        />
                                    </VaultSectionDescription>
                                </VaultTopWrapper>
                                <VaultBottomWrapper>
                                    <VaultInfoContainer>
                                        <VaultInfoLabel>{t('vault.pnl.lifetime-pnl')}:</VaultInfoLabel>
                                        <VaultInfo
                                            color={
                                                vaultData.lifetimePnl === 0
                                                    ? Colors.WHITE
                                                    : vaultData.lifetimePnl > 0
                                                    ? Colors.GREEN
                                                    : Colors.RED
                                            }
                                        >
                                            {formatPercentageWithSign(vaultData.lifetimePnl)}
                                        </VaultInfo>
                                    </VaultInfoContainer>
                                    <VaultInfoContainer>
                                        <VaultInfoLabel>{t('vault.round-end-label')}:</VaultInfoLabel>
                                        <VaultInfo color="#3fd1ff">
                                            {vaultData.isRoundEnded ? (
                                                t('vault.round-ended-label')
                                            ) : (
                                                <TimeRemaining
                                                    end={vaultData.roundEndTime}
                                                    fontSize={20}
                                                    showFullCounter
                                                />
                                            )}
                                        </VaultInfo>
                                    </VaultInfoContainer>
                                </VaultBottomWrapper>
                            </FlexDivColumn>
                        )}
                    </VaultContainer>
                </FlexDivColumn>
            </SPAAnchor>
        </SpaContainer>
    );
};

export default VaultOverview;
