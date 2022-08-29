import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivStart } from 'styles/common';

type SearchProps = {
    text: string;
    customPlaceholder?: string;
    customStyle?: CSSProperties;
    handleChange: (event: any) => void;
    width?: number;
    marginBottom?: number;
};

const Search: React.FC<SearchProps> = ({ text, customPlaceholder, customStyle, handleChange, width, marginBottom }) => {
    const { t } = useTranslation();

    return (
        <Wrapper marginBottom={marginBottom}>
            <Input
                type="text"
                placeholder={customPlaceholder ? customPlaceholder : t('market.search-placeholder')}
                value={text}
                style={customStyle}
                onChange={(event) => handleChange(event.target.value)}
                width={width}
            />
            <IconWrapper>
                <SearchIcon />
            </IconWrapper>
            {text !== '' && <ClearButton onClick={() => handleChange('')}>X</ClearButton>}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivStart)<{ marginBottom?: number }>`
    position: relative;
    width: fit-content;
    margin-bottom: ${(props) => props.marginBottom || 0}px;
`;

const Input = styled.input<{ width?: number }>`
    background: ${(props) => props.theme.background.secondary};
    border-radius: 5px;
    border: 1px solid ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.textColor.primary};
    width: ${(props) => props.width || 230}px;
    height: 34px;
    padding-left: 32px;
    padding-right: 24px;
    font-size: 18px;
    outline: none;
    &::placeholder {
        color: ${(props) => props.theme.textColor.primary};
    }
    &:focus {
        border: 1px solid #3fd1ff !important;
    }
`;

const IconWrapper = styled.div`
    border-radius: 30px;
    background: ${(props) => props.theme.textColor.primary};
    position: absolute;
    width: 22px;
    height: 22px;
    top: 6px;
    left: 6px;
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
    font-size: 18px;
    position: absolute;
    right: 5px;
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.textColor.primary};
    cursor: pointer;
    border: none;
    margin-top: 5px;
`;

export default Search;
