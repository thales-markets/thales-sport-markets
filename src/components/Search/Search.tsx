import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivStart } from 'styles/common';

type SearchProps = {
    text: string;
    customPlaceholder?: string;
    customStyle?: CSSProperties;
    handleChange: (event: any) => void;
    width?: number;
    marginBottom?: number;
    isModal?: boolean;
};

const Search: React.FC<SearchProps> = ({
    text,
    customPlaceholder,
    customStyle,
    handleChange,
    width,
    marginBottom,
    isModal,
}) => {
    const { t } = useTranslation();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <Wrapper marginBottom={marginBottom} isMobile={isMobile}>
            <Input
                type="text"
                placeholder={customPlaceholder ? customPlaceholder : t('market.search-placeholder')}
                value={text}
                style={customStyle}
                onChange={(event) => handleChange(event.target.value)}
                width={width}
                isMobile={isMobile}
                autoFocus={isMobile && isModal}
            />
            <IconWrapper isMobile={isMobile} isModal={isModal}>
                <SearchIcon isMobile={isMobile} isModal={isModal} />
            </IconWrapper>
            {text !== '' && (
                <ClearButton isMobile={isMobile} isModal={isModal} onClick={() => handleChange('')}>
                    x
                </ClearButton>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivStart)<{ marginBottom?: number; isMobile: boolean }>`
    position: relative;
    margin-bottom: ${(props) => props.marginBottom || 0}px;
    width: ${(props) => (props.isMobile ? '100%' : 'fit-content')};
    height: ${(props) => (props.isMobile ? '100%' : '')};
`;

const Input = styled.input<{ width?: number; isMobile: boolean }>`
    background: ${(props) => props.theme.background.primary};
    border-radius: 5px;
    border: 1px solid ${(props) => props.theme.borderColor.quaternary};
    color: ${(props) => props.theme.textColor.quaternary};
    width: ${(props) => (props.isMobile ? '100%' : props.width + 'px' || 250 + 'px')};
    height: ${(props) => (props.isMobile ? '100%' : '24px')};
    padding-left: 32px;
    padding-right: 24px;
    font-weight: 500;
    font-size: ${(props) => (props.isMobile ? '20px' : '12px')};
    line-height: ${(props) => (props.isMobile ? '23px' : '12px')};
    text-align: ${(props) => (props.isMobile ? 'center' : '')};
    outline: none;
    &::placeholder {
        color: ${(props) => props.theme.textColor.secondary};
    }
    &:focus {
        border: 1px solid #3fd1ff !important;
    }
`;

const IconWrapper = styled.div<{ isMobile: boolean; isModal?: boolean }>`
    border-radius: 30px;
    background: ${(props) => (props.isMobile ? props.theme.textColor.quaternary : props.theme.textColor.secondary)};
    position: absolute;
    width: ${(props) => (props.isMobile ? (props.isModal ? '25px' : '22px') : '15px')};
    height: ${(props) => (props.isMobile ? (props.isModal ? '25px' : '22px') : '15px')};
    top: ${(props) => (props.isMobile ? (props.isModal ? '8px' : '3px') : '5px')};
    left: 6px;
`;

const SearchIcon = styled.i<{ isMobile: boolean; isModal?: boolean }>`
    font-size: ${(props) => (props.isMobile ? (props.isModal ? '32px' : '28px') : '20px')};
    position: absolute;
    top: ${(props) => (props.isMobile ? (props.isModal ? '-6px' : '-5px') : '-4px')};
    left: ${(props) => (props.isMobile ? '-4px' : '-3px')};
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0042';
        color: ${(props) => props.theme.background.primary};
    }
`;

const ClearButton = styled.button<{ isMobile: boolean; isModal?: boolean }>`
    font-size: ${(props) => (props.isMobile ? (props.isModal ? '22px' : '18px') : '14px')};
    position: absolute;
    top: ${(props) => (props.isMobile ? (props.isModal ? '2px' : '-1px') : '')};
    right: 5px;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    border: none;
    margin-top: 2px;
    padding-right: 5px;
    padding-left: 5px;
`;

export default Search;
