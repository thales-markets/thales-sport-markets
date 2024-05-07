import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type SearchProps = {
    text: string;
    customPlaceholder?: string;
    handleChange: (event: any) => void;
    disabled?: boolean;
};

const SearchField: React.FC<SearchProps> = ({ text, customPlaceholder, handleChange, disabled = false }) => {
    const { t } = useTranslation();
    return (
        <Wrapper>
            <Input
                type="text"
                placeholder={customPlaceholder ? customPlaceholder : t('market.search-placeholder')}
                value={text}
                onChange={(event) => handleChange(event.target.value)}
                disabled={disabled}
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
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 5px;
    padding: 5px 50px 5px 30px;
    color: ${(props) => props.theme.textColor.primary};
    background: ${(props) => props.theme.background.primary};
    outline: none;
    &::placeholder {
        color: ${(props) => props.theme.textColor.secondary};
    }
    &:focus {
        border: 1px solid ${(props) => props.theme.borderColor.quaternary} !important;
    }
    @media (max-width: 575px) {
        width: 100%;
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const IconWrapper = styled.div`
    border-radius: 30px;
    background: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    width: 17px;
    height: 17px;
    top: 7px;
    left: 6px;
`;

const SearchIcon = styled.i`
    font-size: 22px;
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
