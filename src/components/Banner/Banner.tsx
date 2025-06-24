import React from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import SPAAnchor from '../SPAAnchor';

const IS_VISIBLE = true; // Set to true to show the banner

const Banner: React.FC = () => {
    return !IS_VISIBLE ? (
        <></>
    ) : (
        <SPAAnchor
            href={
                'https://www.overtime.io/dao/thalescouncil.eth/0x53ff4a6fb029f820792a1d1fe4c8749e861c616e1c566d83062ad47968a0065a'
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
