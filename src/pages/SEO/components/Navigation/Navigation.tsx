import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow } from 'styles/common';

export type NavigationItem = {
    index: number;
    i18Label: string;
};

type NavigationProps = {
    items: NavigationItem[];
    selectedItemIndex: number;
    onChangeNavItem: (index: number) => void;
    leftComponent?: JSX.Element;
    additionalStyling?: {
        marginOnWrapper: string;
    };
};

const Navigation: React.FC<NavigationProps> = ({
    items,
    selectedItemIndex,
    onChangeNavItem,
    leftComponent,
    additionalStyling,
}) => {
    const { t } = useTranslation();

    return (
        <Wrapper style={{ margin: additionalStyling?.marginOnWrapper }}>
            <NavItemsWrapper>
                {items.map((item, index) => {
                    return (
                        <NavItem
                            active={item.index == selectedItemIndex}
                            key={`nav-${index}`}
                            onClick={() => onChangeNavItem(item.index)}
                        >
                            {t(item.i18Label)}
                        </NavItem>
                    );
                })}
                <NavItem></NavItem>
            </NavItemsWrapper>
            {leftComponent && leftComponent}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRow)`
    font-size: 14px;
    font-weight: 600;
    border-radius: 7px;
    border: 2px ${(props) => props.theme.borderColor.primary} solid;
    justify-content: flex-start;
    padding: 10px;
    margin: 20px 0px 15px 0px;
`;

const NavItemsWrapper = styled(FlexDiv)`
    flex-direction: row;
`;

const NavItem = styled.span<{ active?: boolean }>`
    padding: 0 10px;
    text-transform: uppercase;
    cursor: pointer;
    color: ${(props) => (props.active ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
`;

export default Navigation;
