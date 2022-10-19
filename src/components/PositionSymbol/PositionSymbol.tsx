import Tooltip from 'components/Tooltip';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';

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
    discount?: number;
};

const PositionSymbol: React.FC<SymbolProps> = ({
    glow,
    type,
    symbolColor,
    additionalText,
    showTooltip,
    additionalStyle,
    children,
    discount,
}) => {
    const { t } = useTranslation();
    return (
        <Wrapper>
            <Container glow={glow} color={symbolColor} style={additionalStyle}>
                <Symbol color={symbolColor}>
                    {type == 0 && '1'}
                    {type == 1 && '2'}
                    {type == 2 && 'X'}
                    {type == 3 && t('common.yes')}
                    {type == 4 && t('common.no')}
                    {type == undefined && children}
                </Symbol>
            </Container>
            {additionalText?.firstText && (
                <AdditionalTextWrapper>
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
                </AdditionalTextWrapper>
            )}
            <AdditionalText style={additionalText?.secondTextStyle}>{additionalText?.secondText}</AdditionalText>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
`;

const Container = styled.div<{ glow?: boolean; color?: string }>`
    width: 40px;
    height: 40px;
    border-radius: 60%;
    border: 3px solid #5f6180;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    border: ${(_props) => (_props?.glow ? '3px solid ' + _props.color : '3px solid #5f6180')};
    box-shadow: ${(_props) => (_props?.glow ? '0 0 6px 2px ' + _props.color : '')};
`;

const AdditionalText = styled.span`
    line-height: 120%;
    font-size: 13px;
    margin-right: 10px;
    display: flex;
    flex-direction: row;
`;

const Symbol = styled.span<{ color?: string }>`
    color: ${(_props) => (_props?.color ? _props.color : '')};
`;

const Discount = styled(FlexDivCentered)<{ color?: string }>`
    color: ${(_props) => (_props?.color ? _props.color : '')};
    font-size: 14px;
    margin-left: 11px;
`;

const AdditionalTextWrapper = styled(FlexDivColumnCentered)`
    text-align: center;
`;

export default PositionSymbol;
