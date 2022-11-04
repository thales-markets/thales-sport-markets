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
                    <span>The Zebro WC NFT Collection</span> is part of an incentivized campaign to represent your
                    favorite country during the World Cup and be eligible for a share of 50,000 OP tokens and 30,000
                    THALES tokens, along with exclusive multipliers for parlays and individual matches.
                </HeaderText>
            </HeaderTextContainer>
        </>
    );
};

const StyledZebraLeft = styled(ZebraLeft)`
    width: 105px;
`;

const StyledZebraRight = styled(ZebraRight)`
    width: 105px;
`;

const HeaderText = styled.span`
    text-align: justify;
    & > span {
        font-style: italic;
        font-weight: bold;
        line-height: 130%;
    }
`;

export default Header;
