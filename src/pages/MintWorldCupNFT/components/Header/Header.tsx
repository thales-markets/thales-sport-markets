import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { HeaderContainer, HeaderTextContainer, HeaderTitle } from 'pages/MintWorldCupNFT/styled-components';
import { ReactComponent as HeaderRectangle } from 'assets/images/favorite-team/header-rectangle.svg';
import { ReactComponent as ZebraLeft } from 'assets/images/favorite-team/zebra-left.svg';
import { ReactComponent as ZebraRight } from 'assets/images/favorite-team/zebra-right.svg';

const Header: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <HeaderContainer>
                <HeaderRectangle />
                <HeaderTitle>
                    <StyledZebraLeft />
                    <span>{t('mint-world-cup-nft.zebro-campaign')}</span>
                    <StyledZebraRight />
                </HeaderTitle>
            </HeaderContainer>
            <HeaderTextContainer>
                <HeaderText>
                    <span>{t('mint-world-cup-nft.zebro-wct-collection')}</span>{' '}
                    {t('mint-world-cup-nft.zebro-wct-collection-text')}
                </HeaderText>
            </HeaderTextContainer>
        </>
    );
};

const StyledZebraLeft = styled(ZebraLeft)`
    width: 105px;
    @media (max-width: 768px) {
        width: 60px;
    }
`;

const StyledZebraRight = styled(ZebraRight)`
    width: 105px;
    @media (max-width: 768px) {
        width: 60px;
    }
`;

const HeaderText = styled.span`
    text-align: justify;
    & > span {
        font-style: italic;
        font-weight: bold;
        line-height: 130%;
    }
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

export default Header;
