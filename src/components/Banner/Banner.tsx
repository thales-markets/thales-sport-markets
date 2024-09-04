import React from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import SPAAnchor from '../SPAAnchor';

const IS_VISIBLE = false;

const Banner: React.FC = () => {
    return !IS_VISIBLE ? (
        <></>
    ) : (
        <SPAAnchor
            href={
                'https://www.thales.io/dao/thalescouncil.eth/0x6a17a87eed3471e95f8ca04b2034c2601ca56dd6b4cf7e632de56f8f3225a531'
            }
        >
            <Container>
                <Label>
                    <Trans
                        i18nKey={'banner.elections-text'}
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
    min-height: 25px;
    z-index: 102;
    cursor: pointer;
    text-align: center;
    padding: 2px 5px;
    margin-bottom: -15px;
    @media (max-width: 767px) {
        min-height: 20px;
    }
`;

const Label = styled.span`
    font-size: 14px;
    line-height: 16px;
    font-weight: 500;
    @media (max-width: 767px) {
        font-size: 12px;
        line-height: 14px;
    }
`;

const HightlightLabel = styled.span`
    color: ${(props) => props.theme.link.textColor.primary};
    font-weight: 700;
`;

export default Banner;
