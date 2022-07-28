import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivStart } from 'styles/common';

type SearchProps = {
    text: string;
    handleChange: (event: any) => void;
};

const Search: React.FC<SearchProps> = ({ text, handleChange }) => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <Input
                type="text"
                placeholder={t('market.search-placeholder')}
                value={text}
                onChange={(event) => handleChange(event.target.value)}
            />
            <IconWrapper>
                <SearchIcon />
            </IconWrapper>
            {text !== '' && <ClearButton onClick={() => handleChange('')}>X</ClearButton>}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivStart)`
    position: relative;
    width: fit-content;
`;

const Input = styled.input`
    background: ${(props) => props.theme.background.secondary};
    border-radius: 5px;
    border: 1px solid ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.textColor.primary};
    width: 230px;
    height: 34px;
    padding-left: 30px;
    padding-right: 10px;
    font-size: 18px;
    outline: none;
    &::placeholder {
        color: ${(props) => props.theme.textColor.primary};
    }
`;

const IconWrapper = styled.div`
    border-radius: 30px;
    background: ${(props) => props.theme.textColor.primary};
    position: absolute;
    width: 22px;
    height: 22px;
    top: 5px;
    left: 3px;
`;

const SearchIcon = styled.i`
    font-size: 28px;
    position: absolute;
    top: -5px;
    left: -4px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0042';
        color: ${(props) => props.theme.background.secondary};
    }
`;

const ClearButton = styled.button`
    height: 100%;
    font-size: 18px;
    position: absolute;
    right: 5px;
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
    border: none;
`;

export default Search;
