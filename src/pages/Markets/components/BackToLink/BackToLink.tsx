import SPAAnchor from 'components/SPAAnchor';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type BackToLinkProps = {
    link: string;
    text: string;
    customStylingContainer?: CSSProperties;
    useArrow?: boolean;
};

const BackToLink: React.FC<BackToLinkProps> = ({ link, text, customStylingContainer, useArrow }) => {
    return (
        <Container style={customStylingContainer}>
            <SPAAnchor href={link}>
                <Link
                    fontFamily={customStylingContainer?.fontFamily}
                    lineHeight={customStylingContainer?.lineHeight?.toString()}
                >
                    {useArrow ? <LeftArrow /> : <LeftIcon />}
                    {text}
                </Link>
            </SPAAnchor>
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    margin-top: 30px;
    cursor: pointer;
`;

const Link = styled(FlexDivCentered)<{ fontFamily?: string; lineHeight?: string }>`
    ${(props) => (props.fontFamily ? `font-family: '${props.fontFamily}' !important;` : '')}
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : '102.6%')};
    letter-spacing: 0.035em;
    color: ${(props) => props.theme.textColor.primary};
    a {
        color: ${(props) => props.theme.textColor.primary};
    }
`;

const LeftIcon = styled.i`
    font-size: 28px;
    margin-right: 0px;
    margin-top: -2px;
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0028';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

const LeftArrow = styled.i`
    font-size: 14px;
    margin-right: 8px;
    text-transform: none;
    transform: rotate(225deg);
    font-weight: 400;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\006C';
    }
`;

export default BackToLink;
