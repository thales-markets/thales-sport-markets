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
    background: ${(props) => props.theme.background.primary};
    border-radius: 5px;
    border: 1px solid ${(props) => props.theme.borderColor.quaternary};
    color: ${(props) => props.theme.textColor.secondary};
    width: ${(props) => props.width || 250}px;
    height: 24px;
    padding-left: 32px;
    padding-right: 24px;
    font-weight: 500;
    font-size: 12px;
    line-height: 12px;
    outline: none;
    &::placeholder {
        color: ${(props) => props.theme.textColor.secondary};
    }
    &:focus {
        border: 1px solid #3fd1ff !important;
    }
`;

const IconWrapper = styled.div`
    border-radius: 30px;
    background: ${(props) => props.theme.textColor.secondary};
    position: absolute;
    width: 15px;
    height: 15px;
    top: 5px;
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

const ClearButton = styled.button`
    font-size: 12px;
    position: absolute;
    right: 5px;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    border: none;
    margin-top: 5px;
`;

export default Search;
