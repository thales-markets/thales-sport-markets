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
                {discount && !isMobile && (
                    <Discount>
                        <div className="discount-label green">
                            <span>-{Math.ceil(Math.abs(discount))}%</span>
                        </div>
                    </Discount>
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

const Wrapper = styled.div<{ disabled?: boolean; isMobile?: boolean; notClickable?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: ${(props) => (props?.isMobile ? 'column' : 'row')};
    cursor: ${(props) => (props?.disabled ? 'not-allowed' : props.notClickable ? 'default' : 'pointer')};
`;

const Container = styled.div<{ glow?: boolean; color?: string; addedToParlay?: boolean; notClickable?: boolean }>`
    width: 30px;
    height: 30px;
    border-radius: 60%;
    border: 3px solid #5f6180;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    font-size: 14px;
    border: ${(props) =>
        props?.glow ? '3px solid ' + props.color : props.addedToParlay ? '3px solid #64D9FE' : '3px solid #5f6180'};
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
`;

const AdditionalText = styled.span`
    line-height: normal;
    font-size: 14px;
    margin-right: 10px;
    display: flex;
    flex-direction: row;
    @media (max-width: 380px) {
        font-size: 12px;
    }
`;

const Symbol = styled.span<{ color?: string; addedToParlay?: boolean; size?: string }>`
    color: ${(props) => (props.addedToParlay ? '#64D9FE' : props?.color ? props.color : '')};
    font-size: ${(props) => (props.size ? props.size : '12px')};
`;

const Discount = styled(FlexDivCentered)<{ color?: string; noDiscount?: boolean }>`
    color: ${(props) => (props?.color ? props.color : '')};
    font-size: 12px;
    margin-left: 2px;
    visibility: ${(props) => (props?.noDiscount ? 'hidden' : '')};
`;

export default PositionSymbol;
