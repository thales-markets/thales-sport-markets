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
    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketId == marketId)[0];

    return (
        <Wrapper
            disabled={showTooltip}
            isMobile={isMobile}
            onClick={() => {
                if (!showTooltip) {
                    if (marketId) {
                        if (addedToParlay && addedToParlay.position == type) {
                            dispatch(removeFromParlay(marketId));
                        } else {
                            if (type !== undefined) {
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

const Wrapper = styled.div<{ disabled?: boolean; isMobile?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: ${(_props) => (_props?.isMobile ? 'column' : 'row')};
    cursor: ${(_props) => (_props?.disabled ? 'not-allowed' : 'pointer')};
`;

const Container = styled.div<{ glow?: boolean; color?: string; addedToParlay?: boolean }>`
    width: 30px;
    height: 30px;
    border-radius: 60%;
    border: 3px solid #5f6180;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    font-size: 14px;
    border: ${(_props) =>
        _props?.glow ? '3px solid ' + _props.color : _props.addedToParlay ? '3px solid #64D9FE' : '3px solid #5f6180'};
    box-shadow: ${(_props) => (_props?.glow ? '0 0 6px 2px ' + _props.color : '')};
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
    color: ${(_props) => (_props.addedToParlay ? '#64D9FE' : _props?.color ? _props.color : '')};
    font-size: ${(_props) => (_props.size ? _props.size : '12px')};
`;

const Discount = styled(FlexDivCentered)<{ color?: string; noDiscount?: boolean }>`
    color: ${(_props) => (_props?.color ? _props.color : '')};
    font-size: 12px;
    margin-left: 2px;
    visibility: ${(_props) => (_props?.noDiscount ? 'hidden' : '')};
`;

export default PositionSymbol;
