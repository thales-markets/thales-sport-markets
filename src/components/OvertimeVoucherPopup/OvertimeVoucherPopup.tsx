import React from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

type OvertimeVoucherPopup = {
    title: string;
    imageSrc: string;
    text?: string;
};

const OvertimeVoucherPopup: React.FC<OvertimeVoucherPopup> = ({ title, imageSrc, text }) => {
    return (
        <OvertimeVoucherPopupContainer>
            <OvertimeVoucherPopupTitle>{title}</OvertimeVoucherPopupTitle>
            <a href={imageSrc} target="_blank" rel="noreferrer">
                <OvertimeVoucherImage src={imageSrc} />
            </a>
            {text && <OvertimeVoucherPopupText>{text}</OvertimeVoucherPopupText>}
        </OvertimeVoucherPopupContainer>
    );
};

const OvertimeVoucherImage = styled.img`
    width: 220px;
    cursor: pointer;
`;

const OvertimeVoucherPopupContainer = styled(FlexDivColumnCentered)`
    text-align: center;
`;

const OvertimeVoucherPopupTitle = styled.span`
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
`;

const OvertimeVoucherPopupText = styled.span`
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 2px;
`;

export default OvertimeVoucherPopup;
