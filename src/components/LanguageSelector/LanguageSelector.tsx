import i18n from 'i18n';
import { DEFAULT_LANGUAGE, LanguageNameMap, SupportedLanguages } from 'i18n/config';
import React, { useEffect, useState } from 'react';
import Flag from 'react-flagpack';
import { withTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import useQueryParam from 'utils/useQueryParams';

type LanguageSelectorProps = {
    isBurger?: boolean;
};

export const LanguageSelectorV2: React.FC<LanguageSelectorProps> = ({ isBurger }) => {
    const [languageDropdownIsOpen, setLanguageDropdownIsOpen] = useState(false);
    const setDropdownIsOpen = (isOpen: boolean) => {
        if (!isOpen && !languageDropdownIsOpen) {
            return;
        }
        setLanguageDropdownIsOpen(isOpen);
    };

    const [selectedLanguage, setSelectedLanguage] = useQueryParam('lang', '');

    useEffect(
        () => {
            setSelectedLanguage(
                (Object.values(SupportedLanguages) as string[]).includes(i18n.language)
                    ? i18n.language
                    : DEFAULT_LANGUAGE
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <>
            <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
                <Container
                    className={isBurger ? 'burger' : ''}
                    data-matomo-category="language-selector"
                    data-matomo-action="click"
                >
                    <LanguageButton
                        onClick={() => {
                            setDropdownIsOpen(!languageDropdownIsOpen);
                        }}
                    >
                        {LanguageFlag(selectedLanguage as any)}
                    </LanguageButton>
                    {languageDropdownIsOpen && (
                        <DropDown className={isBurger ? 'language-dropdown' : ''}>
                            {Object.values(SupportedLanguages).map((language: string) => (
                                <DropDownItem
                                    key={language}
                                    onClick={() => {
                                        i18n.changeLanguage(language);
                                        setDropdownIsOpen(false);
                                        setSelectedLanguage(language);
                                    }}
                                    data-matomo-category="language-selector"
                                    data-matomo-action={language}
                                >
                                    <>
                                        {LanguageFlag(language as any)}
                                        <FlexDivCentered>
                                            <LanguageName key={language}>
                                                {(LanguageNameMap as any)[language]}
                                            </LanguageName>
                                        </FlexDivCentered>
                                    </>
                                </DropDownItem>
                            ))}
                        </DropDown>
                    )}
                </Container>
            </OutsideClickHandler>
        </>
    );
};

const Container = styled(FlexDivColumnCentered)`
    position: relative;
    z-index: 1001;
    &.burger {
        top: -27px;
    }
`;

const LanguageButton = styled.button`
    border: none;
    position: relative;
    cursor: pointer;
    background: transparent;
    &:hover {
        & > i {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const DropDown = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.tertiary};
    box-shadow: 0px 20px 30px rgba(0 0 0 / 0.4);
    border-radius: 7px;
    position: absolute;
    margin-top: 2px;
    padding: 8px;
    top: 40px;
    z-index: 1000;
    &.language-dropdown {
        position: relative;
        box-shadow: none;
        border-radius: 0;
        top: 0;
        left: -16px;
        margin-top: 20px;
        width: 100%;
        background: transparent;
    }
    @media (max-width: 600px) {
        left: initial;
    }
`;

const DropDownItem = styled(FlexDiv)`
    padding: 8px 8px;
    font-size: 1em;
    cursor: pointer;
    & > i {
        color: ${(props) => props.theme.textColor.primary};
    }
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
        & > i {
            color: ${(props) => props.theme.textColor.quaternary};
        }
        & > div > div {
            color: ${(props) => props.theme.textColor.quaternary};
        }
    }
`;

const LanguageName = styled.div`
    font-weight: normal;
    font-size: 1em;
    line-height: 24px;
    letter-spacing: 0.25px;
    color: ${(props) => props.theme.textColor.primary};
    margin-left: 10px;
    display: block;
    text-transform: uppercase;
`;

const LanguageFlag = (language: SupportedLanguages | any) => {
    switch (language) {
        case SupportedLanguages.ENGLISH:
            return <Flag code="GB-UKM" />;
        case SupportedLanguages.CHINESE:
            return <Flag code="CN" />;
        case SupportedLanguages.FRENCH:
            return <Flag code="FR" />;
        case SupportedLanguages.GERMAN:
            return <Flag code="DE" />;
        // case SupportedLanguages.ITALIAN:
        //     return <Flag code="IT" />;
        // case SupportedLanguages.RUSSIAN:
        //     return <Flag code="RU" />;
        case SupportedLanguages.SPANISH:
            return <Flag code="ES" />;
        case SupportedLanguages.THAI:
            return <Flag code="TH" />;
        default:
            return <Flag code="GB-UKM" />;
    }
};

export default withTranslation()(LanguageSelectorV2);
