import Tooltip from 'components/Tooltip';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import guidelines from './guidelines.json';

const Guidelines: React.FC = () => {
    return (
        <ul>
            {guidelines.map((guideline: any) => (
                <li key={guideline.text}>
                    {guideline.text}
                    {guideline.tooltip.trim() !== '' && (
                        <Tooltip
                            overlay={<OverlayContainer>{guideline.tooltip}</OverlayContainer>}
                            iconFontSize={18}
                            marginLeft={2}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
};

const OverlayContainer = styled(FlexDivColumn)`
    text-align: justify;
    white-space: pre-line;
`;

export default Guidelines;
