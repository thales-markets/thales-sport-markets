import { useMatomo } from '@datapunt/matomo-tracker-react';
import Tooltip from 'components/Tooltip';
import { Position } from 'constants/options';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { ParlaysMarketPosition } from 'types/markets';

type SymbolProps = {
    type?: number;
    hideSymbol?: boolean;
    symbolColor?: string;
    symbolSize?: string;
    additionalText?: {
        firstText?: string;
        secondText?: string;
        firstTextStyle?: CSSProperties;
        secondTextStyle?: CSSProperties;
    };
    additionalStyle?: CSSProperties;
    children?: any;
    showTooltip?: boolean;
    glow?: boolean;
    marketId?: string;
    homeTeam?: string;
    awayTeam?: string;
    discount?: number;
    isMobile?: boolean;
    winningSymbol?: boolean;
};

const PositionSymbol: React.FC<SymbolProps> = ({
    glow,
    type,
    symbolColor,
    symbolSize,
    additionalText,
    showTooltip,
    additionalStyle,
    marketId,
    homeTeam,
    awayTeam,
    children,
    discount,
    isMobile,
    winningSymbol,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { trackEvent } = useMatomo();
    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketId == marketId)[0];

    return (
        <Wrapper
            disabled={showTooltip}
            isMobile={isMobile}
            notClickable={!marketId}
            onClick={() => {
                if (!showTooltip) {
                    if (marketId) {
                        if (addedToParlay && addedToParlay.position == type) {
                            dispatch(removeFromParlay(marketId));
                        } else {
                            if (type !== undefined) {
                                trackEvent({
                                    category: 'position',
                                    action: discount == null ? 'non-discount' : 'discount',
                                    value: discount == null ? 0 : Math.ceil(Math.abs(discount)),
                                });
                                const parlayMarket: ParlaysMarketPosition = {
                                    sportMarketId: marketId,
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
            {isMobile && !winningSymbol && (
                <Discount noDiscount={discount == null}>
                    <div className="discount-label green">
                        {discount && <span>-{Math.ceil(Math.abs(discount))}%</span>}
                    </div>
                </Discount>
            )}
            <Container
                glow={glow}
                color={symbolColor}
                style={additionalStyle}
                addedToParlay={addedToParlay && addedToParlay.position == type}
                notClickable={!marketId}
            >
                <Symbol
                    color={symbolColor}
                    size={symbolSize}
                    addedToParlay={addedToParlay && addedToParlay.position == type}
                >
                    {type == 0 && '1'}
                    {type == 1 && '2'}
                    {type == 2 && 'X'}
                    {type == 3 && t('common.yes')}
                    {type == 4 && t('common.no')}
                    {type == undefined && children}
                </Symbol>
                {discount && !isMobile && (
                    <Discount>
                        <span>+{Math.ceil(Math.abs(discount))}%</span>
                    </Discount>
                )}
            </Container>
            <FlexDivColumn>
                {additionalText?.firstText && (
                    <AdditionalText style={additionalText?.firstTextStyle}>
                        {additionalText?.firstText}
                        {showTooltip && (
                            <Tooltip
                                overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                iconFontSize={10}
                                customIconStyling={{
                                    marginTop: isMobile ? '2px' : '-10px',
                                    display: 'flex',
                                    marginLeft: '3px',
                                }}
                            />
                        )}
                    </AdditionalText>
                )}
                {additionalText?.secondText && (
                    <AdditionalText style={additionalText?.secondTextStyle}>
                        {additionalText?.secondText}
                    </AdditionalText>
                )}
            </FlexDivColumn>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)<{ disabled?: boolean; isMobile?: boolean; notClickable?: boolean }>`
    cursor: ${(props) => (props?.disabled ? 'not-allowed' : props.notClickable ? 'default' : 'pointer')};
    align-items: center;
`;

const Container = styled.div<{ glow?: boolean; color?: string; addedToParlay?: boolean; notClickable?: boolean }>`
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
    border: ${(props) =>
        props?.glow ? '2px solid ' + props.color : props.addedToParlay ? '2px solid #64D9FE' : '2px solid #5f6180'};
    box-shadow: ${(props) => (props?.glow ? '0 0 6px 2px ' + props.color : '')};

    @media (hover: hover) {
        &:hover {
            ${(props) => (props.notClickable ? '' : 'border: 3px solid #64d9fe;')}
            & > span {
                ${(props) => (props.notClickable ? '' : 'color: #64d9fe !important;')}
            }
        }
    }

    @media (max-width: 500px) {
        width: 25px;
        height: 25px;
    }
    margin: 0 10px;
`;

const AdditionalText = styled.span`
    font-size: 13px;
    margin-top: 2px;
    @media (max-width: 380px) {
        font-size: 12px;
    }
`;

const Symbol = styled.span<{ color?: string; addedToParlay?: boolean; size?: string }>`
    color: ${(props) => (props.addedToParlay ? '#64D9FE' : props?.color ? props.color : '')};
    font-size: ${(props) => (props.size ? props.size : '12px')};
`;

const Discount = styled(FlexDivCentered)<{ color?: string; noDiscount?: boolean }>`
    position: absolute;
    top: -7px;
    right: -18px;
    font-size: 12px;
    visibility: ${(props) => (props?.noDiscount ? 'hidden' : '')};
    color: #5fc694;
    border-radius: 60%;
    font-weight: 700;
    background: #252940;
    padding: 2px;
`;

export default PositionSymbol;
