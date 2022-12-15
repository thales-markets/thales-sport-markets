import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import React, { useCallback, useEffect, useState } from 'react';
import { buildHref } from 'utils/routes';
import {
    Container,
    ItemContainer,
    ItemIcon,
    DropdownContainer,
    DropDown,
    DropDownItem,
    Label,
    ParlayNumber,
} from './styled-components';
import ConnectWalletButtonMobile from 'components/ConnectWalletButtonMobile';
import { t } from 'i18next';
import { FlexDivCentered } from 'styles/common';
import { OddsType, ODDS_TYPES } from 'constants/markets';
import { setOddsType } from 'redux/modules/ui';
import { useDispatch, useSelector } from 'react-redux';
import OutsideClickHandler from 'react-outside-click-handler';
import { getParlay } from 'redux/modules/parlay';

type FooterSidebarMobileProps = {
    setParlayMobileVisibility: (value: boolean) => void;
    setShowBurger?: (value: boolean) => void;
};

const FooterSidebarMobile: React.FC<FooterSidebarMobileProps> = ({ setParlayMobileVisibility, setShowBurger }) => {
    const dispatch = useDispatch();
    const parlayMarkets = useSelector(getParlay);
    const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false);
    const [pulse, setPulse] = useState(false);

    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
    );

    const animate = () => {
        setPulse(true);

        setTimeout(
            () => setPulse(false),
            parlayMarkets.length == 1 ? (parlayMarkets.length + 1) * 1000 : parlayMarkets.length * 1000
        );
    };

    useEffect(() => {
        animate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parlayMarkets.length]);

    return (
        <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
            <Container>
                <ItemContainer>
                    <ItemIcon
                        className="icon icon--odds"
                        onClick={() => {
                            setDropdownIsOpen(!dropdownIsOpen);
                        }}
                    />
                </ItemContainer>
                {dropdownIsOpen && (
                    <DropdownContainer>
                        <DropDown>
                            {ODDS_TYPES.map((item: any, index: number) => (
                                <DropDownItem
                                    key={index}
                                    onClick={() => {
                                        setSelectedOddsType(item);
                                        setDropdownIsOpen(false);
                                    }}
                                >
                                    <FlexDivCentered>
                                        <Label> {t(`common.odds.${item}`)}</Label>
                                    </FlexDivCentered>
                                </DropDownItem>
                            ))}
                        </DropDown>
                    </DropdownContainer>
                )}

                <ItemContainer>
                    <SPAAnchor href={buildHref(ROUTES.Profile)}>
                        <ItemIcon className="icon icon--profile" />
                    </SPAAnchor>
                </ItemContainer>
                <ItemContainer onClick={() => setParlayMobileVisibility(true)}>
                    <ItemIcon
                        iteration={parlayMarkets.length}
                        className={`icon icon--parlay ${pulse ? 'pulse' : ''}`}
                    />
                    <ParlayNumber>{parlayMarkets.length > 0 ? parlayMarkets.length : ''}</ParlayNumber>
                </ItemContainer>
                {setShowBurger && (
                    <ItemContainer>
                        <ItemIcon
                            className="icon icon--filters"
                            onClick={() => {
                                setShowBurger(true);
                            }}
                        />
                    </ItemContainer>
                )}
                <ItemContainer>
                    <ConnectWalletButtonMobile />
                </ItemContainer>
            </Container>
        </OutsideClickHandler>
    );
};

export default FooterSidebarMobile;
