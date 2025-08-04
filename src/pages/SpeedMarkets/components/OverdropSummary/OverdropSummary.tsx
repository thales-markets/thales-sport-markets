import Tooltip from 'components/Tooltip';
import { t } from 'i18next';
import { HorizontalLine } from 'pages/Markets/Home/Parlay/components/styled-components';
import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getTicketPayment } from 'redux/modules/ticket';
import styled, { useTheme } from 'styled-components';
import { formatCurrency } from 'thales-utils';
import { OverdropMultiplier } from 'types/overdrop';
import { convertCollateralToStable, getCollateral, isOverCurrency } from 'utils/collaterals';
import { formatPoints, getMultiplierIcon, getMultiplierLabel, getTooltipKey } from 'utils/overdrop';
import { useAccount, useChainId, useClient } from 'wagmi';

type OverdropSummaryProps = {
    buyinAmount: number | string;
};

const OverdropSummary: React.FC<OverdropSummaryProps> = ({ buyinAmount }) => {
    const theme = useTheme();
    const { address, isConnected } = useAccount();
    const client = useClient();

    const [isOverdropSummaryOpen] = useState<boolean>(false);

    const userMultipliersQuery = useUserMultipliersQuery(address as any, { enabled: isConnected });

    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;
    const networkId = useChainId();
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const isOver = isOverCurrency(selectedCollateral);
    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates = exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const overdropMultipliers: OverdropMultiplier[] = useMemo(() => {
        const overMultiplier = {
            name: 'thalesMultiplier',
            label: 'OVER used',
            multiplier: isOver ? 10 : 0,
            icon: <OverdropIcon className="icon icon--thales-logo" />,
            tooltip: 'over-boost',
        };
        return [
            ...(userMultipliersQuery.isSuccess
                ? userMultipliersQuery.data.map((multiplier) => ({
                      ...multiplier,
                      label: getMultiplierLabel(multiplier),
                      icon: getMultiplierIcon(multiplier),
                      tooltip: getTooltipKey(multiplier),
                  }))
                : [
                      {
                          name: 'dailyMultiplier',
                          label: 'Days in a row',
                          multiplier: 0,
                          icon: <>0</>,
                          tooltip: 'daily-boost',
                      },
                      {
                          name: 'weeklyMultiplier',
                          label: 'Weeks in a row',
                          multiplier: 0,
                          icon: <>0</>,
                          tooltip: 'weekly-boost',
                      },
                      {
                          name: 'loyaltyMultiplier',
                          label: 'Loyalty boost',
                          multiplier: 0,
                          icon: <>0</>,
                      },
                      {
                          name: 'dailyQuestMultiplier',
                          label: 'Daily quest',
                          multiplier: 0,
                          icon: <>0</>,
                      },
                      {
                          name: 'wheelMultiplier',
                          label: 'Spin the Wheel',
                          multiplier: 0,
                          icon: <>0</>,
                      },
                  ]),
            overMultiplier,
        ];
    }, [userMultipliersQuery.data, userMultipliersQuery.isSuccess, isOver]);

    const convertToStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return convertCollateralToStable(selectedCollateral, value, rate);
        },
        [selectedCollateral, exchangeRates]
    );

    const buyInAmountInDefaultCollateral = useMemo(() => {
        if (!exchangeRates || !buyinAmount) {
            return 0;
        }
        return convertToStable(Number(buyinAmount));
    }, [exchangeRates, buyinAmount, convertToStable]);

    const overdropTotalXP = useMemo(() => {
        if (!buyInAmountInDefaultCollateral) {
            return 0;
        }
        const basePoints = buyInAmountInDefaultCollateral * 2;
        const totalMultiplier = [...overdropMultipliers].reduce((prev, curr) => prev + Number(curr.multiplier), 0);
        return basePoints * (1 + totalMultiplier / 100);
    }, [buyInAmountInDefaultCollateral, overdropMultipliers]);

    const overdropTotalBoost = useMemo(
        () => [...overdropMultipliers].reduce((prev, curr) => prev + Number(curr.multiplier), 0),
        [overdropMultipliers]
    );

    return (
        <>
            <OverdropRowSummary margin="0">
                <OverdropLabel>{t('markets.parlay.overdrop.overdrop-xp')}</OverdropLabel>
                <OverdropValue color={theme.overdrop.textColor.senary}>
                    {`${formatPoints(overdropTotalXP)}`}
                    <OverdropValue>{` (${overdropTotalBoost}% boost)`}</OverdropValue>
                </OverdropValue>
                {/* <Arrow className={!isOverdropSummaryOpen ? 'icon icon--caret-down' : 'icon icon--caret-up'} /> */}
            </OverdropRowSummary>
            {isOverdropSummaryOpen && (
                <OverdropSummaryContainer>
                    <OverdropRowSummary>
                        <OverdropLabel>{t('markets.parlay.overdrop.buy-in-xp')}</OverdropLabel>
                        <OverdropValue>{`${formatCurrency(buyInAmountInDefaultCollateral)} XP`}</OverdropValue>
                    </OverdropRowSummary>
                    <OverdropRowSummary>
                        <OverdropLabel>{t('markets.parlay.overdrop.odds-xp')}</OverdropLabel>
                        <OverdropValue>{`2x`}</OverdropValue>
                    </OverdropRowSummary>
                    <HorizontalLine />
                    {overdropMultipliers.map((multiplier) => (
                        <OverdropRowSummary key={multiplier.name}>
                            <OverdropLabel>
                                {multiplier.label}{' '}
                                <Tooltip
                                    overlay={<>{t(`markets.parlay.overdrop.tooltip.${multiplier.tooltip}`)}</>}
                                    iconFontSize={14}
                                    marginLeft={3}
                                />
                            </OverdropLabel>
                            <OverdropValue>+{multiplier.multiplier}%</OverdropValue>
                        </OverdropRowSummary>
                    ))}
                    <HorizontalLine />
                    <OverdropRowSummary>
                        <OverdropLabel>{t('markets.parlay.overdrop.total-xp-boost')}</OverdropLabel>
                        <OverdropValue>+{overdropTotalBoost}%</OverdropValue>
                    </OverdropRowSummary>
                    <OverdropRowSummary>
                        <OverdropLabel color={theme.overdrop.textColor.senary}>
                            {t('markets.parlay.overdrop.total-xp-earned')}
                        </OverdropLabel>
                        <OverdropValue color={theme.overdrop.textColor.senary}>
                            +{formatPoints(overdropTotalXP)}
                        </OverdropValue>
                    </OverdropRowSummary>
                    {/* <OverdropProgressWrapper>
                        <LeftLevel>LVL {levelItem.level}</LeftLevel>
                        <CurrentLevelProgressLineContainer>
                            <CurrentLevelProgressLine
                                progressUpdateXP={overdropTotalXP}
                                hideLevelLabel
                                showNumbersOnly
                            />
                        </CurrentLevelProgressLineContainer>
                        <RightLevel
                            highlight={
                                overdropTotalXP + (userData?.points ?? 0) >
                                getNextLevelItemByPoints(userData?.points).minimumPoints
                            }
                        >
                            LVL {levelItem.level + 1}
                        </RightLevel>
                    </OverdropProgressWrapper> */}
                </OverdropSummaryContainer>
            )}
        </>
    );
};

export default OverdropSummary;

const RowSummary = styled.div<{ columnDirection?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    ${(props) => (props.columnDirection ? `flex-direction: column;` : '')}
`;

const OverdropRowSummary = styled(RowSummary)<{ margin?: string; isClickable?: boolean }>`
    width: 100%;
    position: relative;
    margin: ${(props) => props.margin || 'inherit'};
    justify-content: space-between;
    ${(props) => (props.isClickable ? 'cursor: pointer;' : '')}
`;

const OverdropLabel = styled.span<{ color?: string }>`
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.color || props.theme.overdrop.textColor.primary};
    i {
        color: ${(props) => props.theme.textColor.septenary};
        font-size: 14px;
    }
    @media (max-width: 950px) {
        line-height: 24px;
    }
`;

const OverdropValue = styled.span<{ color?: string }>`
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    line-height: 20px;
    color: ${(props) => props.color || props.theme.overdrop.textColor.primary};
    margin-left: auto;
    i {
        color: ${(props) => props.theme.textColor.septenary};
    }
`;

const OverdropIcon = styled.i`
    font-size: 13px;
    text-transform: none;
    font-weight: 300;
`;

const OverdropSummaryContainer = styled.div`
    position: absolute;
    width: 100%;
    border-radius: 8px;
`;
