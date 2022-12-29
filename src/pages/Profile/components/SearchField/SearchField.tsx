import { MAIN_COLORS } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type SearchProps = {
    text: string;
    customPlaceholder?: string;
    handleChange: (event: any) => void;
};

const SearchField: React.FC<SearchProps> = ({ text, customPlaceholder, handleChange }) => {
    const { t } = useTranslation();
    return (
        <Wrapper>
            <Input
                type="text"
                placeholder={customPlaceholder ? customPlaceholder : t('market.search-placeholder')}
                value={text}
                onChange={(event) => handleChange(event.target.value)}
            />
            <IconWrapper>
                <SearchIcon />
            </IconWrapper>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    margin: 10px 0px 10px 5px;
    flex-direction: row;
    position: relative;
    @media (max-width: 575px) {
        margin: 0px;
        width: 100%;
    }
`;

const Input = styled.input`
    border: 1px solid ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 5px;
    padding: 5px 50px 5px 30px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    background: ${MAIN_COLORS.DARK_GRAY};
    outline: none;
    &::placeholder {
        color: ${MAIN_COLORS.LIGHT_GRAY};
    }
    &:focus {
        border: 1px solid ${MAIN_COLORS.LIGHT_BLUE} !important;
    }
    @media (max-width: 575px) {
        width: 100%;
    }
`;

const IconWrapper = styled.div`
    border-radius: 30px;
    background: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    width: 15px;
    height: 15px;
    top: 7px;
    left: 6px;
`;

const SearchIcon = styled.i`
    font-size: 20px;
    position: absolute;
    top: -4px;
    left: -3px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0042';
        color: ${(props) => props.theme.background.primary};
    }
`;

export default SearchField;
