import OverAmountImage from 'assets/images/overdrop/over_voucher.png';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';
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
                <OverAmount>
                    <VoucherAmount>
                        {formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.OVER, voucherAmount, 1, true)}
                    </VoucherAmount>
                </OverAmount>
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

    background: #1b2141;
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

const OverAmount = styled(FlexDiv)`
    position: absolute;
    bottom: -25px;
    background-image: url(${OverAmountImage});
    background-repeat: no-repeat;
    width: 100%;
    height: 50px;
    background-size: contain;
    background-position: center;
    justify-content: center;
    align-items: center;
    padding-right: 10px;
`;

const VoucherAmount = styled.span`
    width: 100px;
    margin-left: 30px;
    padding-top: 3px;
    text-align: center;
    font-size: 10px;
    white-space: pre;
    font-weight: 800;
    color: ${(props) => props.theme.overdrop.badge.textColor.primary};
`;

export default LargeBadge;
