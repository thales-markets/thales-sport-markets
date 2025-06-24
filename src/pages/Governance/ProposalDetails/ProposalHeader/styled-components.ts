import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivSpaceBetween } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)`
    padding: 10px 20px;
    height: 160px;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 8px;
`;

export const WidgetWrapper = styled.div<{ isDoubleHeight?: boolean }>`
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-columns: repeat(2, 50%);
    grid-template-rows: ${(props) => (props.isDoubleHeight ? '50% 50%' : '40% 60%;')};
    grid-template-areas: 'top top' 'bottom-left bottom-right';
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        grid-row-gap: 35px;
    }
`;

export const WidgetHeader = styled.div<{ isTwoSided?: boolean; notFlex?: boolean }>`
    grid-area: top;
    height: 100%;
    width: 100%;
    text-align: left;
    padding: 10px 0px 20px;
    display: ${(props) => (props.notFlex ? '' : 'flex')};
    justify-content: ${(props) => (props.isTwoSided ? 'space-between' : '')};
    align-items: center;
`;

export const TimeLeftLabel = styled.label`
    font-weight: 500;
    font-size: 13px;
    line-height: 20px;
    margin-right: 7px;
    color: ${(props) => props.theme.textColor.secondary};
    margin-top: 2px;
`;

export const TitleLabel = styled.span<{ isLink?: boolean; isHighlighted?: boolean }>`
    font-weight: 700;
    font-size: 18px;
    line-height: 25px;
    color: ${(props) =>
        props.isLink || props.isHighlighted ? props.theme.textColor.secondary : props.theme.textColor.primary};
    display: flex;
    margin-left: ${(props) => (props.isHighlighted ? '10px' : '')};
    text-transform: ${(props) => (props.isLink ? '' : 'uppercase')};
    letter-spacing: 1px;
    align-items: baseline;
`;

export const InfoSection = styled.div<{
    side: string;
    direction?: string;
    justifyContent?: string;
    isMobile?: boolean;
}>`
    grid-area: ${(props) => (props.side === 'left' ? 'bottom-left' : 'bottom-right')};
    height: 100%;
    width: 100%;
    padding: ${(props) => (props.side === 'left' ? '30px 20px 5px 0px' : '30px 0px 5px 20px')};
    padding-top: ${(props) => props.isMobile && '90px !important'};
    display: flex;
    flex-direction: ${(props) => (props.direction ? props.direction : 'column')};
    justify-content: ${(props) => (props.justifyContent ? props.justifyContent : 'end')};
    align-items: ${(props) => (props.side === 'left' ? 'start' : 'end')};
    gap: 1px;
`;

export const FlexDivFullWidthSpaceBetween = styled(FlexDivSpaceBetween)<{
    marginRight?: number;
}>`
    width: 100%;
    margin-right: ${(props) => (props.marginRight ? props.marginRight + 'px' : '')};
`;

export const TimeLeftContainer = styled(FlexDivSpaceBetween)`
    margin-bottom: 2px;
`;
