import ConnectWalletButtonMobile from 'components/ConnectWalletButtonMobile';
import SPAAnchor from 'components/SPAAnchor';
import { ODDS_TYPES } from 'constants/markets';
import ROUTES from 'constants/routes';
import { OddsType } from 'enums/markets';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { useDispatch, useSelector } from 'react-redux';
import { getTicket } from 'redux/modules/ticket';
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
    const ticket = useSelector(getTicket);
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

        setTimeout(() => setPulse(false), ticket.length == 1 ? (ticket.length + 1) * 1000 : ticket.length * 1000);
    };

    const ticketLength = useMemo(() => {
        return ticket.length;
    }, [ticket]);

    useEffect(() => {
        animate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticket.length]);

    return (
        <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
            <Container>
                <ItemContainer>
                    <ItemIcon
                        className="icon icon--settings"
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
                            <ItemIcon className="icon icon--profile2" />
                        </SPAAnchor>
                    </ItemContainer>
                )}
                <ItemContainer onClick={() => setParlayMobileVisibility(true)}>
                    <ItemIcon
                        fontSize={36}
                        iteration={ticketLength}
                        className={`icon icon--ticket-horizontal ${pulse ? 'pulse' : ''}`}
                    />
                    <ParlayNumber>{ticketLength || ''}</ParlayNumber>
                </ItemContainer>
                {setShowBurger && (
                    <ItemContainer>
                        <ItemIcon
                            className="icon icon--sports"
                            fontSize={44}
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
