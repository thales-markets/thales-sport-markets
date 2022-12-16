import { useMatomo } from '@datapunt/matomo-tracker-react';
import Tooltip from 'components/Tooltip';
import { Position } from 'constants/options';
import { MAIN_COLORS } from 'constants/ui';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { ParlaysMarketPosition } from 'types/markets';

type SymbolProps = {
    type?: number;
    symbolText: string;
    symbolColor?: string;
    symbolFontSize?: number;
    additionalText?: {
        firstText?: string;
        firstTextStyle?: CSSProperties;
    };
    additionalStyle?: CSSProperties;
    showTooltip?: boolean;
    glow?: boolean;
    marketAddress?: string;
    parentMarket?: string;
    homeTeam?: string;
    awayTeam?: string;
    discount?: number;
    flexDirection?: string;
};

const PositionSymbol: React.FC<SymbolProps> = ({
    glow,
    type,
    symbolText,
    symbolColor,
    symbolFontSize,
    additionalText,
    showTooltip,
    additionalStyle,
    marketAddress,
    parentMarket,
    homeTeam,
    awayTeam,
    discount,
    flexDirection,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { trackEvent } = useMatomo();
    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketAddress == marketAddress)[0];

    return (
        <Wrapper
            disabled={showTooltip}
            flexDirection={flexDirection}
            notClickable={!marketAddress}
            onClick={() => {
                if (!showTooltip) {
                    if (marketAddress && parentMarket) {
                        if (addedToParlay && addedToParlay.position == type) {
                            dispatch(removeFromParlay(marketAddress));
                        } else {
                            if (type !== undefined) {
                                trackEvent({
                                    category: 'position',
                                    action: discount == null ? 'non-discount' : 'discount',
                                    value: discount == null ? 0 : Math.ceil(Math.abs(discount)),
                                });
                                const parlayMarket: ParlaysMarketPosition = {
                                    parentMarket: parentMarket,
                                    sportMarketAddress: marketAddress,
                                    position: Position.HOME,
                                    homeTeam: homeTeam || '',
                                    awayTeam: awayTeam || '',
                                };
                                switch (type) {
                                    case 3:
                                        parlayMarket.position = Position.HOME;
                                        break;
                                    case 4:
                                        parlayMarket.position = Position.AWAY;
                                        break;
                                    default:
                                        parlayMarket.position = type;
                                        break;
                                }
                                dispatch(updateParlay(parlayMarket));
                            }
                        }
                    }
                }
            }}
        >
            <Container
                glow={glow}
                color={symbolColor}
                style={additionalStyle}
                addedToParlay={addedToParlay && addedToParlay.position == type}
                notClickable={!marketAddress}
                flexDirection={flexDirection}
                disabled={showTooltip}
            >
                <Symbol
                    color={symbolColor}
                    fontSize={symbolFontSize}
                    addedToParlay={addedToParlay && addedToParlay.position == type}
                >
                    {symbolText}
                </Symbol>
                {discount && (
                    <Discount>
                        <span>+{Math.ceil(Math.abs(discount))}%</span>
                    </Discount>
                )}
            </Container>
            <FlexDivColumn>
                {additionalText?.firstText && (
                    <AdditionalText style={additionalText?.firstTextStyle} flexDirection={flexDirection}>
                        {additionalText?.firstText}
                        {showTooltip && (
                            <Tooltip overlay={<>{t('markets.zero-odds-tooltip')}</>} iconFontSize={11} marginLeft={3} />
                        )}
                    </AdditionalText>
                )}
            </FlexDivColumn>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)<{ disabled?: boolean; flexDirection?: string; notClickable?: boolean }>`
    cursor: ${(props) => (props.disabled || props.notClickable ? 'default' : 'pointer')};
    align-items: center;
    flex-direction: ${(props) => (props.flexDirection ? props.flexDirection : 'row')};
`;

const Container = styled.div<{
    glow?: boolean;
    color?: string;
    addedToParlay?: boolean;
    disabled?: boolean;
    notClickable?: boolean;
    flexDirection?: string;
}>`
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 60%;
    border: 3px solid #5f6180;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    font-size: 13px;
    opacity: ${(props) => (props.disabled ? 0.4 : 1)};
    border: ${(props) =>
        props?.glow ? '3px solid ' + props.color : props.addedToParlay ? '3px solid #64D9FE' : '3px solid #5f6180'};
    box-shadow: ${(props) => (props?.glow ? '0 0 6px 2px ' + props.color : '')};
    :hover {
        ${(props) => (props.disabled || props.notClickable ? '' : 'border: 3px solid #64d9fe;')}
        & > span {
            ${(props) => (props.disabled || props.notClickable ? '' : 'color: #64d9fe !important;')}
        }
    }

    @media (max-width: 500px) {
        width: 25px;
        height: 25px;
    }
    margin: ${(props) => (props.flexDirection === 'column' ? '0 10px' : '0 0')};
`;

const AdditionalText = styled.span<{
    flexDirection?: string;
}>`
    font-size: 13px;
    margin-top: ${(props) => (props.flexDirection === 'column' ? 2 : 0)}px;
    margin-right: ${(props) => (props.flexDirection === 'column' ? 0 : 10)}px;
    @media (max-width: 380px) {
        font-size: 12px;
    }
`;

const Symbol = styled.span<{ color?: string; addedToParlay?: boolean; fontSize?: number }>`
    color: ${(props) => (props.addedToParlay ? MAIN_COLORS.TEXT.BLUE : props.color || MAIN_COLORS.TEXT.WHITE)};
    font-size: ${(props) => props.fontSize || 12}px;
`;

const Discount = styled(FlexDivCentered)`
    position: absolute;
    top: -7px;
    right: -18px;
    font-size: 12px;
    color: #5fc694;
    border-radius: 60%;
    font-weight: 700;
    background: #252940;
    padding: 2px;
`;

export default PositionSymbol;
