import styled from 'styled-components';

export const CollapseContainer = styled.div<{ hideLine?: boolean; marginBottom?: string }>`
    margin-bottom: ${(props) => (props.marginBottom ? props.marginBottom : '20px')};
    border-bottom: 1px solid ${(props) => (props.hideLine ? 'transparent' : props.theme.borderColor.quaternary)};
`;

export const CollapseIcon = styled.i`
    padding-left: 3px;
    font-size: 13px;
`;

export const Highlight = styled.div<{
    marginBottom?: string;
    marginTop?: string;
    marginRight?: string;
    cursor?: string;
    fontSize?: string;
    fontFamily?: string;
    textAlign?: string;
    downwardsArrowAlignRight?: boolean;
}>`
    cursor: ${(props) => (props.cursor ? props.cursor : 'default')};
    color: white;
    font-family: ${(props) => (props.fontFamily ? props.fontFamily : 'MontserratBold')};
    font-size: ${(props) => (props.fontSize ? props.fontSize : '17px')};
    font-style: normal;
    margin-bottom: ${(props) => (props.marginBottom ? props.marginBottom : '0px')};
    margin-top: ${(props) => (props.marginTop ? props.marginTop : '')};
    margin-right: ${(props) => (props.marginRight ? props.marginRight : '5px')};
    line-height: 140%;
    text-align: ${(props) => (props.textAlign ? props.textAlign : 'left')};
    display: ${(props) => (props.downwardsArrowAlignRight ? 'flex' : 'block')};
    justify-content: ${(props) => (props.downwardsArrowAlignRight ? 'space-between' : '')};
    @media screen and (max-width: 767px) {
        font-size: 18px;
        font-size: ${(props) => (props.fontSize ? props.fontSize : '15px')};
    }
`;
