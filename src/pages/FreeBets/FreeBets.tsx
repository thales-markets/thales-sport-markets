import axios from 'axios';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getInfoToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import useGetIsWhitelistedQuery from 'queries/freeBets/useGetIsWhitelistedQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getTicketPayment } from 'redux/modules/ticket';
import styled, { useTheme } from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumnCentered,
    FlexDivColumnNative,
    FlexDivEnd,
    FlexDivRow,
    FlexDivSpaceBetween,
} from 'styles/common';
import { Coins, formatCurrency, formatCurrencyWithSign } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getFreeBetCollaterals, isStableCurrency } from 'utils/collaterals';
import { useAccount, useChainId, useClient, useSignMessage } from 'wagmi';
import multipleCollateral from '../../utils/contracts/multipleCollateralContract';
import StatsTable from './StatsTable';

const FUND_WALLET_ADDRESS = '0x23Ea88E828188377DCB4663ff2FE419B1fC71F88';

enum Tab {
    GENERATE = 'generate',
    STATS = 'stats',
}

const NavItems = [
    {
        id: Tab.GENERATE,
        label: 'Generate',
    },
    {
        id: Tab.STATS,
        label: 'Stats',
    },
];

const FreeBets: React.FC = () => {
    const { t } = useTranslation();
    const walletAddress = useAccount()?.address || '';
    const networkId = useChainId();
    const { signMessageAsync } = useSignMessage();
    const theme: ThemeInterface = useTheme();
    const client = useClient();

    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

    const [selectedTab, setSelectedTab] = useState<Tab>(Tab.GENERATE);
    const [betAmount, setBetAmount] = useState<number | string>('');
    const [numberOfBets, setNumberOfBets] = useState<number | string>('');
    const [generatedIds, setGeneratedIds] = useState<string[]>([]);
    const supportedCollaterals = useMemo(() => [...getFreeBetCollaterals(networkId), CRYPTO_CURRENCY_MAP.THALES], [
        networkId,
    ]);
    const selectedCollateral = useMemo(() => supportedCollaterals[selectedCollateralIndex], [
        selectedCollateralIndex,
        supportedCollaterals,
    ]);
    const selectedCollateralAddress = useMemo(
        () => multipleCollateral[selectedCollateral as keyof typeof multipleCollateral]?.addresses[networkId],
        [networkId, selectedCollateral]
    );

    const multipleCollateralBalancesQuery = useMultipleCollateralBalanceQuery(FUND_WALLET_ADDRESS, {
        networkId,
        client,
    });
    const multipleCollateralBalances: { [key: string]: number } = useMemo(
        () => multipleCollateralBalancesQuery?.data || {},
        [multipleCollateralBalancesQuery?.data]
    );

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates = exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const isWhitelistedQuery = useGetIsWhitelistedQuery(walletAddress, networkId);
    const isWhitelisted = isWhitelistedQuery.isSuccess && isWhitelistedQuery.data;

    const onGenerateBets = useCallback(async () => {
        const toastId = toast.loading(t('market.toast-message.transaction-pending'));
        const signature = await signMessageAsync({ message: JSON.stringify({ betAmount, numberOfBets }) });

        if (walletAddress && signature) {
            try {
                const response = await axios.post(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/generate-free-bets`,
                    {
                        betAmount,
                        numberOfBets,
                        signature,
                        collateral: selectedCollateralAddress,
                    }
                );
                if (typeof response.data !== 'string') {
                    toast.update(toastId, getSuccessToastOptions('Success'));
                    setGeneratedIds(response.data);
                }
            } catch (e: any) {
                if (e?.response?.data) {
                    toast.update(toastId, getErrorToastOptions(e.response.data));
                } else {
                    toast.update(toastId, getErrorToastOptions('Unknown error'));
                }
                console.log(e);
            }
        }
    }, [t, signMessageAsync, betAmount, numberOfBets, walletAddress, networkId, selectedCollateralAddress]);

    const submitDisabled =
        !walletAddress ||
        !isWhitelisted ||
        !betAmount ||
        !numberOfBets ||
        selectedCollateralIndex > supportedCollaterals.length - 1 ||
        !multipleCollateralBalances[selectedCollateral] ||
        +betAmount * +numberOfBets > multipleCollateralBalances[selectedCollateral];

    const getUSDForCollateral = useCallback(
        (collateral: Coins) =>
            (multipleCollateralBalances ? multipleCollateralBalances[collateral] : 0) *
            (isStableCurrency(collateral as Coins) ? 1 : exchangeRates?.[collateral] || 0),
        [multipleCollateralBalances, exchangeRates]
    );

    return (
        <>
            <Header>
                <NavWrapper>
                    <NavItemWrapper>
                        {NavItems.map((item) => (
                            <NavItem
                                key={item.id}
                                selected={selectedTab === item.id}
                                onClick={() => setSelectedTab(item.id)}
                            >
                                {item.label}
                            </NavItem>
                        ))}
                    </NavItemWrapper>
                </NavWrapper>
            </Header>

            {selectedTab === Tab.GENERATE && (
                <GenerateContainer>
                    <FlexDivColumnCentered>
                        <span>{t('free-bet.admin.disclaimer')}</span>
                        <br />
                        <span> {FUND_WALLET_ADDRESS}</span>
                        <br />
                        <span>
                            {t('free-bet.admin.available-gas')}: {formatCurrency(multipleCollateralBalances.ETH, 4)} ETH
                            {` (${formatCurrencyWithSign(
                                USD_SIGN,
                                getUSDForCollateral(CRYPTO_CURRENCY_MAP.ETH as Coins)
                            )})`}
                        </span>
                        <br />
                        <FlexDiv>
                            <NumericInput
                                label={t('free-bet.admin.bet-amount')}
                                value={betAmount}
                                onChange={(e) => {
                                    setBetAmount(+e.target.value);
                                }}
                                balance={`${formatCurrencyWithSign(
                                    null,
                                    multipleCollateralBalances[selectedCollateral]
                                )}`}
                                inputFontWeight="600"
                                inputPadding="5px 10px"
                                borderColor={theme.input.borderColor.tertiary}
                                currencyComponent={
                                    <CollateralSelector
                                        collateralArray={supportedCollaterals}
                                        collateralBalances={multipleCollateralBalances}
                                        selectedItem={selectedCollateralIndex}
                                        onChangeCollateral={() => {
                                            setBetAmount('');
                                        }}
                                        isDetailedView
                                        exchangeRates={exchangeRates}
                                    />
                                }
                            />
                        </FlexDiv>
                        <FlexDiv>
                            <NumericInput
                                label={t('free-bet.admin.number-of-bets')}
                                value={numberOfBets}
                                onChange={(e) => {
                                    setNumberOfBets(+e.target.value);
                                }}
                                borderColor={theme.input.borderColor.tertiary}
                            />
                        </FlexDiv>
                        <FlexDivCentered>
                            <Button disabled={submitDisabled} onClick={onGenerateBets}>
                                {t('free-bet.admin.generate')}
                            </Button>
                        </FlexDivCentered>
                    </FlexDivColumnCentered>
                    <br />
                    <FlexDivColumnCentered gap={10}>
                        {!!generatedIds.length && (
                            <FlexDivEnd>
                                <FlexDivCentered gap={5}>
                                    {t('free-bet.admin.copy-all')}
                                    <CopyIcon
                                        onClick={() => {
                                            const toastId = toast.loading(t('free-bet.admin.copying'), {
                                                autoClose: 1000,
                                            });
                                            navigator.clipboard.writeText(
                                                generatedIds
                                                    .map((id) => `https://overtimemarkets.xyz/markets?freeBet=${id}`)
                                                    .join('\n')
                                            );
                                            toast.update(toastId, {
                                                ...getInfoToastOptions(t('free-bet.admin.copied-all')),
                                                autoClose: 1000,
                                            });
                                        }}
                                        className="icon icon--copy"
                                    />
                                </FlexDivCentered>
                            </FlexDivEnd>
                        )}
                        <FlexDivColumnCentered gap={5}>
                            {generatedIds.map((id, index) => (
                                <FlexDivSpaceBetween key={id}>
                                    <span>{`${index}. https://overtimemarkets.xyz/markets?freeBet=${id}`}</span>
                                    <CopyIcon
                                        onClick={() => {
                                            const toastId = toast.loading(t('free-bet.admin.copying'), {
                                                autoClose: 1000,
                                            });
                                            navigator.clipboard.writeText(
                                                `https://overtimemarkets.xyz/markets?freeBet=${id}`
                                            );
                                            toast.update(toastId, {
                                                ...getInfoToastOptions(t('free-bet.admin.copied') + ' ' + id),
                                                autoClose: 1000,
                                            });
                                        }}
                                        className="icon icon--copy"
                                    />
                                </FlexDivSpaceBetween>
                            ))}
                        </FlexDivColumnCentered>
                    </FlexDivColumnCentered>
                </GenerateContainer>
            )}
            {selectedTab === Tab.STATS && <StatsTable />}
        </>
    );
};

const GenerateContainer = styled(FlexDivColumnNative)`
    margin-top: 100px;
    @media (max-width: 767px) {
        width: 100%;
        padding: 5px;
        font-size: 14px;
    }
`;

export const CopyIcon = styled.i`
    margin-left: 5px;
    font-size: 24px;
    cursor: pointer;
    font-weight: 400;
    color: ${(props) => props.theme.overdrop.textColor.primary};
    @media (max-width: 767px) {
        font-size: 20px;
    }
`;

const Header = styled(FlexDivRow)`
    position: absolute;
    top: 100px;
    width: 100%;
    @media (max-width: 767px) {
        margin-bottom: 15px;
        top: 150px;
    }
`;

const NavWrapper = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 5px;
`;

const NavItemWrapper = styled(FlexDivRow)`
    gap: 20px;
    width: 200px;
    position: relative;
    padding: 0 40px;
    text-align: start;
    @media (max-width: 767px) {
        padding: 0 10px;
        width: fit-content;
    }
`;

const NavItem = styled.span<{ selected: boolean }>`
    color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    i {
        color: ${(props) => (props.selected ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    }
    @media (max-width: 767px) {
        font-size: 10px;
        white-space: nowrap;
    }
`;

export default FreeBets;
