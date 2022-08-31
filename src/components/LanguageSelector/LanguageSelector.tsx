import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import i18n from 'i18n';
import OutsideClickHandler from 'react-outside-click-handler';
import styled from 'styled-components';
import { DEFAULT_LANGUAGE, LanguageNameMap, SupportedLanguages } from 'i18n/config';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import Tooltip from 'components/Tooltip';
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

    const selectedLanguage = (Object.values(SupportedLanguages) as string[]).includes(i18n.language)
        ? i18n.language
        : DEFAULT_LANGUAGE;

    return (
        <>
            <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
                <Container className={isBurger ? 'burger' : ''}>
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
                                        i18n.changeLanguage(DEFAULT_LANGUAGE);
                                        setDropdownIsOpen(false);
                                    }}
                                >
                                    {language !== SupportedLanguages.ENGLISH ? (
                                        <>
                                            {LanguageFlag(language as any, true)}
                                            <FlexDivCentered>
                                                <LanguageName style={{ color: 'grey' }} key={language}>
                                                    {(LanguageNameMap as any)[language] + '*'}
                                                </LanguageName>
                                                <Tooltip
                                                    overlay={'Coming soon'}
                                                    component={<Icon className={`icon-exotic icon-exotic--info`} />}
                                                    iconFontSize={23}
                                                    marginLeft={2}
                                                    top={0}
                                                />
                                            </FlexDivCentered>
                                        </>
                                    ) : (
                                        <>
                                            {LanguageFlag(language as any)}
                                            <FlexDivCentered>
                                                <LanguageName key={language}>
                                                    {(LanguageNameMap as any)[language]}
                                                </LanguageName>
                                            </FlexDivCentered>
                                        </>
                                    )}
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
    align-items: flex-end;
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

const FlagIcon = styled.i`
    font-size: 2.4em;
    @media (max-width: 1024px) {
        font-size: 2.1em;
    }
    &.disabled {
        cursor: default;
        opacity: 0.4;
    }
    color: ${(props) => props.theme.textColor.secondary};
`;

const DropDown = styled(FlexDivColumn)`
    background: ${(props) => props.theme.background.secondary};
    box-shadow: 0px 20px 30px rgba(0, 0, 0, 0.4);
    border-radius: 7px;
    position: absolute;
    margin-top: 2px;
    padding: 8px;
    top: 40px;
    left: 0;
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

const Icon = styled.i`
    font-size: 26px;
    margin-left: 4px;
    margin-right: 7px;
`;

const LanguageFlag = (language: SupportedLanguages | any, notSupported?: boolean) => {
    switch (language) {
        case SupportedLanguages.ENGLISH:
            return <FlagIcon className="icon-homepage icon-homepage--en" />;

        // case SupportedLanguages.RUSSIAN:
        //     return <FlagIcon style={{ color: 'grey' }} className="icon-home icon-home--ru" />;

        case SupportedLanguages.CHINESE:
            return (
                <FlagIcon style={{ color: notSupported ? 'gray' : '' }} className="icon-homepage icon-homepage--cn" />
            );

        default:
            return <FlagIcon className="icon-homepage icon-homepage--en" />;
    }
};

export default withTranslation()(LanguageSelectorV2);
