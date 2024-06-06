import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

type WrapperNavigationProps = {
    tabIndex: number;
    onChangeTab: (index: number) => void;
};

const WrapperNavigation: React.FC<WrapperNavigationProps> = ({ tabIndex, onChangeTab }) => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <NavItem active={tabIndex == 0} onClick={() => onChangeTab(0)}>
                {t('profile.wrapper-nav.my-portfolio')}
            </NavItem>
            <NavItem active={tabIndex == 1} onClick={() => onChangeTab(1)}>
                {t('profile.wrapper-nav.my-tickets')}
            </NavItem>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    width: 100%;
    border-bottom: 2px ${(props) => props.theme.borderColor.quaternary} solid;
    flex-direction: row;
    margin-top: 15px;
    margin-bottom: 25px;
    @media (max-width: 575px) {
        margin-top: 10px;
        margin-bottom: 15px;
    }
`;

const NavItem = styled(FlexDiv)<{ active?: boolean }>`
    align-items: center;
    color: ${(props) =>
        props?.active ? props.theme.button.textColor.quaternary : props.theme.button.background.tertiary};
    font-size: 18px;
    font-weight: 600;
    text-align: left;
    text-transform: uppercase;
    padding-bottom: 10px;
    padding-right: 40px;
    cursor: pointer;
`;

export default WrapperNavigation;
