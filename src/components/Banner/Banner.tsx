import React from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import SPAAnchor from '../SPAAnchor';

const Banner: React.FC = () => {
    return (
        <SPAAnchor href={'https://www.overtimemarkets.xyz/'}>
            <Container>
                <Label>
                    <Trans
                        i18nKey={'banner.v1-text'}
                        components={{
                            highlight: <HightlightLabel />,
                        }}
                    />
                </Label>
            </Container>
        </SPAAnchor>
    );
};

const Container = styled(FlexDiv)`
    width: 100%;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.textColor.quinary};
    background-color: ${(props) => props.theme.background.secondary};
    min-height: 20px;
    z-index: 102;
    cursor: pointer;
    text-align: center;
    padding: 2px 5px;
    @media screen and (max-width: 100px) {
        display: none;
    }
`;

const Label = styled.span`
    font-size: 12px;
    line-height: 14px;
    font-weight: 500;
`;

const HightlightLabel = styled.span`
    color: ${(props) => props.theme.link.textColor.primary};
    font-weight: 700;
`;

export default Banner;
