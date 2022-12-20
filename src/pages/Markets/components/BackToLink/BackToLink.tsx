import SPAAnchor from 'components/SPAAnchor';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type BackToLinkProps = {
    link: string;
    text: string;
    customStylingContainer?: CSSProperties;
};

const BackToLink: React.FC<BackToLinkProps> = ({ link, text, customStylingContainer }) => {
    return (
        <Container style={customStylingContainer}>
            <SPAAnchor href={link}>
                <Link>
                    <LeftIcon />
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

const Link = styled(FlexDivCentered)`
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 102.6%;
    letter-spacing: 0.035em;
    color: ${(props) => props.theme.textColor.primary};
    a {
        color: ${(props) => props.theme.textColor.primary};
    }
`;

const LeftIcon = styled.i`
    font-size: 20px;
    margin-right: 4px;
    margin-top: -2px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0041';
        color: ${(props) => props.theme.textColor.primary};
    }
`;

export default BackToLink;
