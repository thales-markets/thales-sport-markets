import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { formatPoints } from 'utils/overdrop';

type LargeBadgeProps = {
    level: number;
    requiredPointsForLevel: number;
    levelName: string;
    reached: boolean;
    voucherAmount?: number;
    highlight?: boolean;
};

const LargeBadge: React.FC<LargeBadgeProps> = ({
    level,
    requiredPointsForLevel,
    levelName,
    reached,
    voucherAmount,
    highlight,
}) => {
    const { t } = useTranslation();

    const levelItem = OVERDROP_LEVELS.find((item) => item.level == level);

    return (
        <Wrapper active={reached} highlight={highlight}>
            <LevelName active={reached}>{levelName}</LevelName>
            <BadgeImage active={reached} src={levelItem ? levelItem.largeBadge : ''} />
            {!reached && (
                <LockWrapper>
                    <Icon className="icon icon--lock" />
                </LockWrapper>
            )}

            <XPLabel active={reached}>{formatPoints(requiredPointsForLevel)}</XPLabel>
            <LevelLabel active={reached}>{t('overdrop.overdrop-home.level')}</LevelLabel>
            <Level active={reached}>{level}</Level>
            {!!voucherAmount && (
                <Voucher>
                    <FreeBetBadge>Free bet</FreeBetBadge>
                    <VoucherAmount>
                        {formatCurrencyWithKey(USD_SIGN + CRYPTO_CURRENCY_MAP.OVER, voucherAmount, 1, true)}
                    </VoucherAmount>
                </Voucher>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)<{ active?: boolean; highlight?: boolean }>`
    margin-top: 40px;
    margin-bottom: ${(props) => (props.highlight ? '50px' : '')};

    max-width: 125px;
    height: 306px;
    padding: 10px;
    border-radius: 14px;
    border: 2px solid #2c345e;

    background: ${(props) =>
        props.active ? props.theme.overdrop.badge.background.primary : props.theme.overdrop.badge.background.secondary};
    align-items: center;
    position: relative;
`;

const BadgeImage = styled.img<{ active?: boolean }>`
    position: absolute;
    top: 40px;
    width: 140px;
    height: 140px;
    opacity: ${(props) => (props.active ? '1' : '0.4')};
    /* @media (max-width: 767px) {
        width: 50px;
        height: 50px;
    } */
`;

const LockWrapper = styled(FlexDivColumn)`
    position: absolute;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    top: 50px;
    background-color: ${(props) => props.theme.overdrop.badge.background.secondary};
    border: 3px solid ${(props) => props.theme.overdrop.borderColor.primary};
    border-radius: 50%;
    text-align: center;
`;

const Icon = styled.i`
    color: ${(props) => props.theme.overdrop.borderColor.primary};
    height: 22px;
`;

const XPLabel = styled.span<{ active?: boolean }>`
    font-size: 16px;
    font-weight: 700;
    margin: 3px;
    text-transform: uppercase;
    color: ${(props) => (props.active ? props.theme.textColor.primary : props.theme.overdrop.textColor.inactive)};
`;

const LevelLabel = styled(XPLabel)<{ active?: boolean }>`
    color: ${(props) => (props.active ? '#fbce0f' : props.theme.overdrop.textColor.inactive)};
    font-size: 16.444px;
    font-style: normal;
    font-weight: 300;
    line-height: normal;
    letter-spacing: 0.576px;
    text-transform: uppercase;
`;

const Level = styled(LevelLabel)`
    color: ${(props) => (props.active ? '#fbce0f' : props.theme.overdrop.textColor.inactive)};
    font-size: 38.489px;
    font-style: normal;
    font-weight: 800;
    line-height: 80%; /* 30.791px */
    letter-spacing: 3.464px;
    text-transform: uppercase;
`;

const LevelName = styled(XPLabel)`
    color: ${(props) => (props.active ? props.theme.textColor.primary : props.theme.overdrop.textColor.inactive)};

    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;

    text-transform: uppercase;
    margin-bottom: 165px;
`;

const Voucher = styled(FlexDivColumnCentered)`
    position: absolute;
    bottom: -58px;
    gap: 6px;
`;

const FreeBetBadge = styled(FlexDiv)`
    align-items: center;
    justify-content: center;

    border-radius: 20px;
    border: 1px solid rgba(104, 124, 220, 0.3);
    background: ${(props) => props.theme.overdrop.badge.background.primary};
    height: 22px;
    padding: 3px 9px 5px 13px;

    white-space: nowrap;
    color: #687cdc;

    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
`;

const VoucherAmount = styled.span`
    width: 100px;

    text-align: center;
    font-size: 12px;
    line-height: 20px;
    white-space: pre;
    font-weight: 700;
    color: ${(props) => props.theme.overdrop.badge.textColor.primary};
`;

export default LargeBadge;
