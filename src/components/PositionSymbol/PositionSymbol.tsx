import Tooltip from 'components/Tooltip';
import { Position } from 'constants/options';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type SymbolProps = {
    type?: number;
    symbolColor?: string;
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
    discount?: number;
};

const PositionSymbol: React.FC<SymbolProps> = ({
    glow,
    type,
    symbolColor,
    additionalText,
    showTooltip,
    additionalStyle,
    marketId,
    children,
    discount,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const parlay = useSelector(getParlay);

    const addedToParlay = parlay.filter((game: any) => game.sportMarketId == marketId)[0];

    return (
        <Wrapper
            onClick={() => {
                if (marketId) {
                    if (addedToParlay && addedToParlay.position == type) {
                        dispatch(removeFromParlay(marketId));
                    } else {
                        if (type !== undefined) {
                            switch (type) {
                                case 3:
                                    dispatch(updateParlay({ sportMarketId: marketId, position: Position.HOME }));
                                    break;
                                case 4:
                                    dispatch(updateParlay({ sportMarketId: marketId, position: Position.AWAY }));
                                    break;
                                default:
                                    dispatch(updateParlay({ sportMarketId: marketId, position: type }));
                                    break;
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
            >
                <Symbol color={symbolColor} addedToParlay={addedToParlay && addedToParlay.position == type}>
                    {type == 0 && '1'}
                    {type == 1 && '2'}
                    {type == 2 && 'X'}
                    {type == 3 && t('common.yes')}
                    {type == 4 && t('common.no')}
                    {type == undefined && children}
                </Symbol>
            </Container>
            {additionalText?.firstText && (
                <AdditionalText style={additionalText?.firstTextStyle}>
                    {additionalText?.firstText}
                    {showTooltip && (
                        <Tooltip
                            overlay={<>{t('markets.zero-odds-tooltip')}</>}
                            iconFontSize={10}
                            customIconStyling={{ marginTop: '-10px', display: 'flex', marginLeft: '3px' }}
                        />
                    )}
                </AdditionalText>
            )}
            {discount && (
                <Discount>
                    <Tooltip
                        overlay={
                            <span>
                                {t(`markets.discounted-per`)}{' '}
                                <a
                                    href="https://github.com/thales-markets/thales-improvement-proposals/blob/main/TIPs/TIP-95.md"
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    TIP-95
                                </a>
                            </span>
                        }
                        component={
                            <div className="discount-label green">
                                <span>-{Math.ceil(Math.abs(discount))}%</span>
                            </div>
                        }
                        iconFontSize={23}
                        marginLeft={2}
                        top={0}
                    />
                </Discount>
            )}
            {additionalText?.secondText && (
                <AdditionalText style={additionalText?.secondTextStyle}>{additionalText?.secondText}</AdditionalText>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    cursor: pointer;
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
`;

const AdditionalText = styled.span`
    line-height: normal;
    font-size: 14px;
    margin-right: 10px;
    display: flex;
    flex-direction: row;
`;

const Symbol = styled.span<{ color?: string; addedToParlay?: boolean }>`
    color: ${(_props) => (_props.addedToParlay ? '#64D9FE' : _props?.color ? _props.color : '')};
    font-size: 12px;
`;

const Discount = styled(FlexDivCentered)<{ color?: string }>`
    color: ${(_props) => (_props?.color ? _props.color : '')};
    font-size: 14px;
    margin-left: 11px;
`;

export default PositionSymbol;
