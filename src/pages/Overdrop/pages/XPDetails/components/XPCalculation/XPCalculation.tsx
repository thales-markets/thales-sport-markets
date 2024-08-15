import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { MultiplierType } from 'types/overdrop';
import { getMultiplierValueFromQuery } from 'utils/overdrop';

const XPCalculation: React.FC = () => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const userMultipliersQuery = useUserMultipliersQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userMultipliers = useMemo(() => {
        if (userMultipliersQuery?.isSuccess && userMultipliersQuery?.data) {
            return userMultipliersQuery.data;
        }
        return;
    }, [userMultipliersQuery.data, userMultipliersQuery?.isSuccess]);

    const sumOfMultipliers = useMemo(() => {
        return (
            getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY) +
            getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) +
            getMultiplierValueFromQuery(userMultipliers, MultiplierType.TWITTER) +
            getMultiplierValueFromQuery(userMultipliers, MultiplierType.LOYALTY)
        );
    }, [userMultipliers]);

    return isMobile ? (
        <Wrapper>
            <MobileWrapper>
                <BoxWrapper>
                    <BoxLabel>{t('overdrop.xp-details.days-in-row')}</BoxLabel>
                    <GradientBorder>
                        <Box>
                            <Badge>{getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) / 5}</Badge>
                            <MainLabel>{t('overdrop.xp-details.daily-multiplier')}</MainLabel>
                            <Value>{`+${getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY)}%`}</Value>
                        </Box>
                    </GradientBorder>
                </BoxWrapper>
                <BoxWrapper>
                    <BoxLabel>{t('overdrop.xp-details.weeks-in-row')}</BoxLabel>
                    <GradientBorder>
                        <Box>
                            <Badge>{getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY) / 5}</Badge>
                            <MainLabel>{t('overdrop.xp-details.weekly-multiplier')}</MainLabel>
                            <Value>{`+${getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY)}%`}</Value>
                        </Box>
                    </GradientBorder>
                </BoxWrapper>
            </MobileWrapper>

            <Signs>{'+'}</Signs>

            <MobileWrapper>
                <BoxWrapper>
                    <BoxLabel>{t('overdrop.xp-details.loyalty-boost')}</BoxLabel>
                    <GradientBorder>
                        <Box>
                            <Badge>{<Icon style={{ fontSize: 18 }} className="icon icon--swag" />}</Badge>
                            <MainLabel>{t('overdrop.xp-details.loyalty-multiplier')}</MainLabel>
                            <Value>{`+${getMultiplierValueFromQuery(userMultipliers, MultiplierType.LOYALTY)}%`}</Value>
                        </Box>
                    </GradientBorder>
                </BoxWrapper>
                <BoxWrapper>
                    <BoxLabel>{t('overdrop.xp-details.shared-flex')}</BoxLabel>
                    <GradientBorder>
                        <Box>
                            <Badge>{<Icon className="icon icon--x-twitter" />}</Badge>
                            <MainLabel>{t('overdrop.xp-details.twitter-multiplier')}</MainLabel>
                            <Value>{`+${getMultiplierValueFromQuery(userMultipliers, MultiplierType.TWITTER)}%`}</Value>
                        </Box>
                    </GradientBorder>
                </BoxWrapper>
            </MobileWrapper>

            <Signs>{'='}</Signs>

            <BoxWrapper>
                <MainLabel>{t('overdrop.xp-details.total-bonus')}</MainLabel>
                <HighlightedValue>{`+${sumOfMultipliers}%`}</HighlightedValue>
            </BoxWrapper>
        </Wrapper>
    ) : (
        <Wrapper>
            <BoxWrapper>
                <BoxLabel>{t('overdrop.xp-details.days-in-row')}</BoxLabel>
                <GradientBorder>
                    <Box>
                        <Badge>{getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) / 5}</Badge>
                        <MainLabel>{t('overdrop.xp-details.daily-multiplier')}</MainLabel>
                        <Value>{`+${getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY)}%`}</Value>
                    </Box>
                </GradientBorder>
            </BoxWrapper>
            <Signs>{'+'}</Signs>
            <BoxWrapper>
                <BoxLabel>{t('overdrop.xp-details.weeks-in-row')}</BoxLabel>
                <GradientBorder>
                    <Box>
                        <Badge>{getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY) / 5}</Badge>
                        <MainLabel>{t('overdrop.xp-details.weekly-multiplier')}</MainLabel>
                        <Value>{`+${getMultiplierValueFromQuery(userMultipliers, MultiplierType.WEEKLY)}%`}</Value>
                    </Box>
                </GradientBorder>
            </BoxWrapper>
            <Signs>{'+'}</Signs>
            <BoxWrapper>
                <BoxLabel>{t('overdrop.xp-details.loyalty-boost')}</BoxLabel>
                <GradientBorder>
                    <Box>
                        <Badge>{<Icon style={{ fontSize: 16 }} className="icon icon--swag" />}</Badge>
                        <MainLabel>{t('overdrop.xp-details.loyalty-multiplier')}</MainLabel>
                        <Value>{`+${getMultiplierValueFromQuery(userMultipliers, MultiplierType.LOYALTY)}%`}</Value>
                    </Box>
                </GradientBorder>
            </BoxWrapper>
            <Signs>{'+'}</Signs>
            <BoxWrapper>
                <BoxLabel>{t('overdrop.xp-details.shared-flex')}</BoxLabel>
                <GradientBorder>
                    <Box>
                        <Badge>{<Icon className="icon icon--x-twitter" />}</Badge>
                        <MainLabel>{t('overdrop.xp-details.twitter-multiplier')}</MainLabel>
                        <Value>{`+${getMultiplierValueFromQuery(userMultipliers, MultiplierType.TWITTER)}%`}</Value>
                    </Box>
                </GradientBorder>
            </BoxWrapper>
            <Signs>{'='}</Signs>
            <BoxWrapper>
                <MainLabel>{t('overdrop.xp-details.total-bonus')}</MainLabel>
                <HighlightedValue>{`+${sumOfMultipliers}%`}</HighlightedValue>
            </BoxWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRow)`
    justify-content: center;
    align-items: center;
    margin: 25px 0px;
    width: 100%;
`;

const MobileWrapper = styled(FlexDivColumnCentered)`
    gap: 16px;
`;

const BoxWrapper = styled(FlexDivColumn)`
    border-radius: 6px;
    align-items: center;
    justify-content: center;
`;

const GradientBorder = styled.div`
    border-radius: 6px;
    background: ${(props) => props.theme.overdrop.borderColor.secondary};
    padding: 2px;
`;

const Box = styled(FlexDivColumn)`
    position: relative;
    align-items: center;
    justify-content: center;
    border-radius: 6.5px;
    padding: 7px 14px;
    width: 100px;
    background: ${(props) => props.theme.overdrop.background.active};
`;

const MainLabel = styled.span`
    font-size: 13px;
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
`;

const BoxLabel = styled(MainLabel)`
    font-size: 9.5px;
    font-weight: 400;
    margin-bottom: 5px;
`;

const Value = styled(MainLabel)`
    font-size: 29px;
    font-weight: 800;
`;

const Signs = styled(Value)``;

const HighlightedValue = styled(Value)`
    font-size: 35px;
    font-weight: 700;
    color: ${(props) => props.theme.overdrop.textColor.primary};
`;

const Badge = styled(FlexDivCentered)`
    width: 24px;
    position: absolute;
    top: -10px;
    left: -10px;
    height: 24px;
    color: ${(props) => props.theme.overdrop.textColor.secondary};
    font-weight: 900;
    font-size: 13px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.overdrop.badge.background.primary};
`;

const Icon = styled.i`
    font-size: 13px;
    text-transform: none;
    font-weight: 300;
`;

export default XPCalculation;
