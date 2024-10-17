import { Collapse as MaterialCollapse } from '@material-ui/core';
import { useState } from 'react';
import { CollapseContainer, CollapseIcon, Highlight } from './styled-components';

type CollapseProps = {
    headerTextAlign?: string;
    title: string;
    hideLine?: boolean;
    additionalStyling?: {
        titleFontSize?: string;
        titleFontFamily?: string;
        titleMarginBottom?: string;
        titleMarginRight?: string;
        titleMarginTop?: string;
        downwardsArrowAlignRight?: boolean;
        containerMarginBottom?: string;
    };
};

const Collapse: React.FC<CollapseProps> = ({ title, hideLine, additionalStyling, children, headerTextAlign }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <CollapseContainer hideLine={hideLine} marginBottom={additionalStyling?.containerMarginBottom}>
            <Highlight
                cursor="pointer"
                marginBottom={additionalStyling?.titleMarginBottom ? additionalStyling?.titleMarginBottom : '20px'}
                marginTop={additionalStyling?.titleMarginTop ? additionalStyling?.titleMarginTop : ''}
                marginRight={additionalStyling?.titleMarginRight ? additionalStyling?.titleMarginRight : ''}
                fontSize={additionalStyling?.titleFontSize}
                fontFamily={additionalStyling?.titleFontFamily}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
                textAlign={headerTextAlign}
                downwardsArrowAlignRight={additionalStyling?.downwardsArrowAlignRight}
            >
                <span>{title}</span>
                <CollapseIcon className={`icon ${isOpen ? 'icon--caret-up' : 'icon--caret-down'}`} />
            </Highlight>
            <MaterialCollapse in={isOpen}>{children}</MaterialCollapse>
        </CollapseContainer>
    );
};

export default Collapse;
