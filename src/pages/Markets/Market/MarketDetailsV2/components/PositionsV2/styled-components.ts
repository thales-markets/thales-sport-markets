import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';

export const Container = styled(FlexDivColumn)<{ isExpanded: boolean; isMainPageView?: boolean; noOdds?: boolean }>`
    position: relative;
    padding: ${(props) => (props.isMainPageView ? '0px' : '5px 0px')};
    border-bottom: ${(props) => (!props.isExpanded ? `1px solid ${props.theme.borderColor.primary}` : 'none')};
    margin-bottom: ${(props) => (!props.isExpanded ? `5px` : '0')};
    flex: ${(props) => (props.isMainPageView ? '1' : 'initial')};
    justify-content: ${(props) => (props.noOdds ? `center` : '')};
    @media (max-width: 950px) {
        padding: ${(props) => (props.isMainPageView ? '10px 0px 0px 0px' : '5px 0px')};
    }
`;

export const Header = styled(FlexDivColumnCentered)<{ isMainPageView?: boolean; isColumnView?: boolean }>`
    position: relative;
    max-height: ${(props) => (props.isMainPageView && !props.isColumnView ? 'auto' : '25px')};
    flex: none;
`;

export const Title = styled.span<{ isExpanded: boolean; isMainPageView?: boolean; isColumnView?: boolean }>`
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    margin-bottom: ${(props) => (props.isMainPageView ? (props.isColumnView ? 8 : 14) : props.isExpanded ? 5 : 0)}px;
    text-align: center;
`;

export const SubTitleContainer = styled(FlexDiv)`
    font-size: 12px;
    line-height: 14px;
    color: ${(props) => props.theme.textColor.quinary};
`;

export const SubTitle = styled.span`
    font-size: 12px;
    line-height: 14px;
    width: 100%;
    text-align: center;    margin-bottom: 5px;
}
`;

export const ContentContianer = styled(FlexDiv)`
    flex-direction: column;
    flex: 1;
`;

export const ContentWrapper = styled(FlexDivColumn)``;

export const ContentRow = styled.div<{ gridMinMaxPercentage: number; isColumnView?: boolean }>`
    margin-bottom: ${(props) => (props.isColumnView ? '0' : '5px')};
    margin-right: ${(props) => (props.isColumnView ? '5px' : '0')};
    display: ${(props) => (props.isColumnView ? 'flex' : 'grid')};
    grid-template-columns: repeat(auto-fit, minmax(calc(${(props) => props.gridMinMaxPercentage}% - 5px), 1fr));
    gap: 5px;
    flex-direction: column;
    flex: 1;
`;

export const Arrow = styled.i`
    font-size: 12px;
    color: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    top: 4px;
    right: 0px;
    margin-right: 2px;
    cursor: pointer;
`;

export const Message = styled.span`
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    text-align: center;
    color: ${(props) => props.theme.error.textColor.primary};
`;
