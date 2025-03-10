import { TicketErrorCode } from 'enums/markets';
import { Coins } from 'thales-utils';
import { SystemBetData, TicketMarket } from './markets';

export type ShareTicketModalProps = {
    markets: TicketMarket[];
    multiSingle: boolean;
    paid: number;
    payout: number;
    onClose: () => void;
    isTicketLost: boolean;
    collateral: Coins;
    isLive: boolean;
    isSgp: boolean;
    applyPayoutMultiplier: boolean;
    isTicketOpen: boolean;
    systemBetData?: SystemBetData;
};

export type TicketError = {
    code: TicketErrorCode;
    data: string;
};
