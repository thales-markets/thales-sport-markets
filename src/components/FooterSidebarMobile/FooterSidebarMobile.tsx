import ConnectWalletButtonMobile from 'components/ConnectWalletButtonMobile';
import SPAAnchor from 'components/SPAAnchor';
import { ODDS_TYPES } from 'constants/markets';
import ROUTES from 'constants/routes';
import { OddsType } from 'enums/markets';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { useDispatch, useSelector } from 'react-redux';
import { getCombinedPositions, getParlay } from 'redux/modules/parlay';
import { setOddsType } from 'redux/modules/ui';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
import { buildHref } from 'utils/routes';
import {
    Container,
    DropDown,
    DropDownItem,
    DropdownContainer,
    ItemContainer,
    ItemIcon,
    Label,
    ParlayNumber,
} from './styled-components';

type FooterSidebarMobileProps = {
    setParlayMobileVisibility: (value: boolean) => void;
    setShowBurger?: (value: boolean) => void;
};

const FooterSidebarMobile: React.FC<FooterSidebarMobileProps> = ({ setParlayMobileVisibility, setShowBurger }) => {
    const dispatch = useDispatch();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const parlayMarkets = useSelector(getParlay);
    const combinedPositions = useSelector(getCombinedPositions);
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

    const ticketLength = useMemo(() => {
        return parlayMarkets.length + combinedPositions.length;
    }, [parlayMarkets, combinedPositions]);

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

                {isWalletConnected && (
                    <ItemContainer>
                        <SPAAnchor href={buildHref(ROUTES.Profile)}>
                            <ItemIcon className="icon icon--profile" />
                        </SPAAnchor>
                    </ItemContainer>
                )}
                <ItemContainer onClick={() => setParlayMobileVisibility(true)}>
                    <ItemIcon iteration={ticketLength} className={`icon icon--parlay ${pulse ? 'pulse' : ''}`} />
                    <ParlayNumber>{ticketLength || ''}</ParlayNumber>
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
