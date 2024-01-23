import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import SPAAnchor from '../SPAAnchor';

const ElectionsBanner: React.FC = () => {
    const { t } = useTranslation();
    return (
        <SPAAnchor href={'https://dune.com/leifu/arb-incentive-program-dashboard'}>
            <Container>
                <Label>{t('banner.arb-distribution-message')}</Label>
            </Container>
        </SPAAnchor>
    );
};

const Container = styled(FlexDiv)`
    position: absolute;
    top: 0;
    width: 100%;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.button.textColor.primary};
    background-color: ${(props) => props.theme.background.quaternary};
    min-height: 32px;
    z-index: 102;
    cursor: pointer;
    text-align: center;
    @media screen and (max-width: 767px) {
        display: none;
    }
`;

const Label = styled.span`
    color: ${(props) => props.theme.textColor.tertiary};
    font-size: 18px;
    padding: 7px 0px;
    font-style: normal;
    font-weight: 800;
    text-transform: uppercase;
`;

export default ElectionsBanner;
