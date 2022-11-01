import React from 'react';
import { useTranslation } from 'react-i18next';
import { Item, Wrapper } from './styled-components';

export const navItems = [
    {
        id: 1,
        i18Label: 'profile.open-claimable',
    },
    {
        id: 2,
        i18Label: 'profile.transaction-history',
    },
];

type NavigationBarProps = {
    itemSelected: number;
    onSelectItem: (index: number) => void;
};

const NavigationBar: React.FC<NavigationBarProps> = ({ itemSelected, onSelectItem }) => {
    const { t } = useTranslation();
    return (
        <Wrapper>
            {navItems.map((item, index) => {
                return (
                    <Item key={index} selected={item.id == itemSelected} onClick={() => onSelectItem(item.id)}>
                        {t(item.i18Label)}
                    </Item>
                );
            })}
        </Wrapper>
    );
};

export default NavigationBar;
