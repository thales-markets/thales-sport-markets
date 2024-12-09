import ConnectWalletButtonMobile from 'components/ConnectWalletButtonMobile';
import OutsideClickHandler from 'components/OutsideClick';
import SPAAnchor from 'components/SPAAnchor';
import { ODDS_TYPES } from 'constants/markets';
import ROUTES from 'constants/routes';
import { secondsToMilliseconds } from 'date-fns';
import { OddsType } from 'enums/markets';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTicket } from 'redux/modules/ticket';
import { setOddsType } from 'redux/modules/ui';
import { FlexDivCentered } from 'styles/common';
import { buildHref } from 'utils/routes';
import { useAccount } from 'wagmi';
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

    const { isConnected } = useAccount();

    const ticket = useSelector(getTicket);
    const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false);
    const [pulse, setPulse] = useState(false);

    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
    );

    const ticketLength = useMemo(() => {
        return ticket.length;
    }, [ticket]);

    useEffect(() => {
        const animate = () => {
            setPulse(true);

            setTimeout(() => setPulse(false), secondsToMilliseconds(ticket.length === 1 ? 2 : ticket.length));
        };

        animate();
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

                {isConnected && (
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
