import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivStart } from 'styles/common';
import { RootState } from 'types/redux';

type SearchProps = {
    text: string;
    handleChange: (event: any) => void;
    width?: number;
    customPlaceholder?: string;
    customColor?: string;
};

const Search: React.FC<SearchProps> = ({ text, handleChange, width, customPlaceholder, customColor }) => {
    const { t } = useTranslation();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <Wrapper>
            <Input
                type="text"
                placeholder={customPlaceholder || t('market.search-placeholder')}
                value={text}
                onChange={(event) => handleChange(event.target.value)}
                width={width}
                autoFocus={isMobile}
                customColor={customColor}
            />
            <IconWrapper>
                <SearchIcon customColor={customColor} />
            </IconWrapper>
            {text !== '' && <ClearIcon className="icon icon--close" onClick={() => handleChange('')} />}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivStart)<{ marginBottom?: number }>`
    position: relative;
    margin-bottom: ${(props) => props.marginBottom || 0}px;
    width: fit-content;
    @media (max-width: 950px) {
        width: 100%;
        height: 100%;
    }
`;

const Input = styled.input<{ width?: number; customColor?: string }>`
    background: ${(props) => props.theme.background.primary};
    border-radius: 5px;
    border: 1px solid ${(props) => (props?.customColor ? props.customColor : props.theme.borderColor.primary)};
    color: ${(props) => props.theme.textColor.primary};
    width: ${(props) => props.width || 250}px;
    height: 24px;
    padding-left: 32px;
    padding-right: 24px;
    font-weight: 400;
    font-size: 12px;
    line-height: 12px;
    outline: none;
    &::placeholder {
        color: ${(props) => (props?.customColor ? props.customColor : props.theme.textColor.secondary)};
    }
    &:focus {
        border: 1px solid ${(props) => props.theme.textColor.quaternary} !important;
    }
    @media (max-width: 950px) {
        border-radius: 15px;
        width: 100%;
        height: 100%;
        font-size: 20px;
        line-height: 23px;
        text-align: center;
        padding-right: 30px;
    }
`;

const IconWrapper = styled.div`
    border-radius: 30px;
    position: absolute;
    width: 15px;
    height: 15px;
    top: 4px;
    left: 6px;
    @media (max-width: 950px) {
        width: 25px;
        height: 25px;
        top: 8px;
    }
`;

const SearchIcon = styled.i<{ customColor?: string }>`
    font-size: 14px;
    position: absolute;
    top: 0;
    left: 0;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\00E5';
        color: ${(props) => (props?.customColor ? props.customColor : props.theme.textColor.secondary)};
    }
    @media (max-width: 950px) {
        font-size: 20px;
    }
`;

const ClearIcon = styled.i`
    position: absolute;
    top: 1px;
    color: ${(props) => props.theme.textColor.secondary};
    right: 2px;
    font-size: 10px;
    cursor: pointer;
    padding: 6px;
    @media (max-width: 950px) {
        top: 5px;
        font-size: 16px;
    }
`;

export default Search;
