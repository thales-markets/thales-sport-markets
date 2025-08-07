import BtcCard from 'assets/images/flex-cards/btc-card.png';
import EthCard from 'assets/images/flex-cards/eth-card.png';
import { CRYPTO_CURRENCY_MAP, currencyKeyToNameMap, USD_SIGN } from 'constants/currency';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
    FlexDivRowCentered,
} from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { ShareSpeedPositionData, ShareSpeedPositionType } from 'types/speedMarkets';
import { ThemeInterface } from 'types/ui';
import { formatValueWithCollateral } from 'utils/collaterals';
import { useChainId } from 'wagmi';

const SpeedMarketFlexCard: React.FC<ShareSpeedPositionData> = ({
    type,
    position,
    asset,
    strikePrice,
    paid,
    payout,
    collateral,
    marketDuration,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();

    const strikePriceFormatted = formatCurrencyWithSign(USD_SIGN, strikePrice);

    const textColor =
        type === 'speed-potential'
            ? theme.speedMarkets.flexCard.textColor.potential
            : type === 'speed-won'
            ? theme.speedMarkets.flexCard.textColor.won
            : theme.speedMarkets.flexCard.textColor.loss;

    return (
        <ContainerBorder $isWon={type === 'speed-won'}>
            <Container currencyKey={asset} type={type}>
                <FlexDivColumn>
                    <LogoWrapper>
                        <LogoIcon
                            $color={textColor}
                            className="speedmarkets-logo-icon speedmarkets-logo-icon--speed-full-logo"
                        />
                    </LogoWrapper>
                    {type !== 'speed-loss' && (
                        <StatusContainer>
                            <StatusHeading color={textColor}>
                                {type === 'speed-potential'
                                    ? t('speed-markets.flex-card.potential-win')
                                    : t('speed-markets.flex-card.won')}
                            </StatusHeading>
                            <Status color={textColor}>
                                {formatValueWithCollateral(payout, collateral, networkId)}
                            </Status>
                        </StatusContainer>
                    )}
                </FlexDivColumn>
                <MarketDetailsRow>
                    <FlexDivRowCentered>
                        <CurrencyIcon
                            color={textColor}
                            className={`speedmarkets-logo-icon speedmarkets-logo-icon--${asset.toLowerCase()}-logo`}
                        />
                        <Asset>
                            <AssetName color={textColor}>{currencyKeyToNameMap[asset]}</AssetName>
                            <Position color={textColor}>{`${asset.toUpperCase()} ${position}`}</Position>
                        </Asset>
                    </FlexDivRowCentered>
                    <MarketDetailsContainer>
                        <FlexDivRowCentered>
                            <ItemName color={textColor}>{t('speed-markets.flex-card.strike-price')}</ItemName>
                            <Value color={textColor}>{strikePriceFormatted}</Value>
                        </FlexDivRowCentered>
                        <FlexDivRowCentered>
                            <ItemName color={textColor}>{t('speed-markets.flex-card.market-duration')}</ItemName>
                            <Value color={textColor}>{marketDuration}</Value>
                        </FlexDivRowCentered>
                        <FlexDivRowCentered>
                            <ItemName color={textColor}>{t('speed-markets.flex-card.buy-in')}</ItemName>
                            <Value color={textColor}>{formatValueWithCollateral(paid, collateral, networkId)}</Value>
                        </FlexDivRowCentered>
                    </MarketDetailsContainer>
                </MarketDetailsRow>
                {type === 'speed-loss' && <LossWatermark>{t('speed-markets.flex-card.loss')}</LossWatermark>}
            </Container>
        </ContainerBorder>
    );
};

const Container = styled(FlexDivColumnCentered)<{ currencyKey: string; type: ShareSpeedPositionType }>`
    ${(props) =>
        props.type === 'speed-won'
            ? ''
            : `border: 10px solid ${
                  props.type === 'speed-potential'
                      ? props.theme.speedMarkets.flexCard.background.potential
                      : props.theme.speedMarkets.flexCard.background.loss
              };`}
    border-radius: 15px;

    width: ${(props) => (props.type === 'speed-won' ? '363px' : '383px')};
    height: ${(props) => (props.type === 'speed-won' ? '490px' : '510px')};

    padding: 10px;
    background: ${(props) => `url(${props.currencyKey === CRYPTO_CURRENCY_MAP.BTC ? BtcCard : EthCard})`};
    background-position: center;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: ${(props) => (props.type === 'speed-won' ? '347px' : '357px')};
        height: ${(props) => (props.type === 'speed-won' ? '466px' : '476px')};

        ${(props) => (props.type !== 'speed-won' ? 'border-width: 5px;' : '')}

        background-size: cover;
    }
`;

const ContainerBorder = styled.div<{ $isWon: boolean }>`
    ${(props) => (props.$isWon ? `background: ${props.theme.speedMarkets.flexCard.background.won};` : '')}
    ${(props) => (props.$isWon ? 'padding: 10px;' : '')}
    ${(props) => (props.$isWon ? 'border-radius: 15px;' : '')}

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        ${(props) => (props.$isWon ? 'padding: 5px;' : '')}
    }
`;

const MarketDetailsRow = styled(FlexDivRow)`
    padding-bottom: 24px;
`;

const MarketDetailsContainer = styled(FlexDivColumn)`
    max-width: 185px;
    gap: 5px;
`;

const ItemName = styled.span<{ color: string }>`
    color: ${(props) => props.color};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 14px;
    font-weight: 400;
    text-transform: capitalize;
`;

const Value = styled.span<{ color: string }>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-weight: 700;
    text-wrap: nowrap;
    font-size: 14px;
    color: ${(props) => props.color};
`;

const StatusContainer = styled(FlexDiv)`
    width: 100%;
    flex-direction: column;
    margin-top: 10px;
`;

const StatusHeading = styled.span<{ color: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.color};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 35px;
    font-weight: 300;
    text-transform: uppercase;
    text-align: center;
    ::before {
        width: 13px;
        height: 13px;
        margin: 0px 5px;
        transform: rotate(45deg);
        content: '';
        display: inline-block;
        background-color: ${(props) => props.color};
    }
    ::after {
        width: 13px;
        margin: 0px 5px;
        height: 13px;
        transform: rotate(45deg);
        content: '';
        display: inline-block;
        background-color: ${(props) => props.color};
    }
`;

const Status = styled.span<{ color: string }>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 45px;
    font-weight: 800;
    text-align: center;
    color: ${(props) => props.color};
`;

const CurrencyIcon = styled.i<{ color: string }>`
    font-size: 40px;
    margin-right: 5px;
    color: ${(props) => props.color};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 36px;
    }
`;

const Asset = styled(FlexDivColumn)`
    gap: 5px;
`;

const AssetName = styled.span<{ color: string }>`
    color: ${(props) => props.color};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 18px;
    font-weight: 400;
    text-transform: capitalize;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 15px;
    }
`;

const Position = styled.span<{ color: string }>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    color: ${(props) => props.color};
    font-size: 18px;
    font-weight: 700;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 15px;
    }
`;

const LossWatermark = styled(FlexDivCentered)`
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    width: 295px;
    height: 110px;
    transform: rotate(-45deg);
    border: 10px solid ${(props) => props.theme.speedMarkets.flexCard.background.loss};
    border-radius: 20px;
    font-size: 55px;
    font-weight: 700;
    letter-spacing: 16px;
    text-transform: uppercase;
    color: ${(props) => props.theme.speedMarkets.flexCard.background.loss};
`;

const LogoWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 63px;
`;

const LogoIcon = styled.i<{ $color: string }>`
    font-size: 130px;
    color: ${(props) => props.$color};
`;

export default SpeedMarketFlexCard;
