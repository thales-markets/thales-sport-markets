import React from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderContainer, HeaderSymbolsContainer, HeaderText } from 'pages/MintWorldCupNFT/styled-components';
import { ReactComponent as HeaderRectangle } from 'assets/images/favorite-team/header-rectangle.svg';
import { ReactComponent as HeaderSymbols } from 'assets/images/favorite-team/header-symbols.svg';

const Header: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <HeaderContainer>
                <HeaderRectangle />
                <HeaderText>{t('mint-world-cup-nft.qatar-2022')}</HeaderText>
            </HeaderContainer>
            <HeaderSymbolsContainer>
                <HeaderSymbols />
            </HeaderSymbolsContainer>
        </>
    );
};

export default Header;
