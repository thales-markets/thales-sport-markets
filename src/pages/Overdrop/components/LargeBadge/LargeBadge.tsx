import ThalesAmountImage from 'assets/images/overdrop/thales_voucher.png';
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
            <BadgeImage active={reached} src={levelItem ? levelItem.largeBadge : ''} />
            {!reached && (
                <LockWrapper>
                    <Icon className="icon icon--lock" />
                </LockWrapper>
            )}
            <XPLabel active={reached}>{formatPoints(requiredPointsForLevel)}</XPLabel>
            <LevelLabel active={reached}>{t('overdrop.overdrop-home.level')}</LevelLabel>
            <Level active={reached}>{level}</Level>
            <LevelName active={reached}>{levelName}</LevelName>
            {!!voucherAmount && (
                <ThalesAmount>
                    <VoucherAmount>
                        {formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.THALES, voucherAmount, 1, true)}
                    </VoucherAmount>
                </ThalesAmount>
            )}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)<{ active?: boolean; highlight?: boolean }>`
    min-width: 122px;
    margin-top: 40px;
    margin-bottom: ${(props) => (props.highlight ? '50px' : '')};
    border: 3px solid transparent;
    border-radius: 6px;
    background: linear-gradient(
                ${(props) => (props.active ? props.theme.overdrop.background.active : props.theme.background.quinary)} 0
                    0
            )
            padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
    align-items: center;
    position: relative;
    padding: 70px 0px 10px 0px;
    flex: 1 0 18%;
    @media (max-width: 767px) {
        min-width: 90px;
    }
`;

const BadgeImage = styled.img<{ active?: boolean }>`
    position: absolute;
    top: -40px;
    width: 100px;
    height: 100px;
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
    width: 74px;
    height: 74px;
    top: -30px;
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
    font-size: 13.5px;
    font-weight: 700;
    margin: 3px;
    text-transform: uppercase;
    color: ${(props) => (props.active ? props.theme.textColor.primary : props.theme.overdrop.textColor.inactive)};
`;

const LevelLabel = styled(XPLabel)<{ active?: boolean }>`
    font-weight: 300;
    text-transform: uppercase;
    color: ${(props) =>
        props.active ? props.theme.overdrop.textColor.primary : props.theme.overdrop.textColor.inactive};
`;

const Level = styled(LevelLabel)`
    font-weight: 800;
    font-size: 25.038px;
`;

const LevelName = styled(XPLabel)`
    font-weight: 600;
    font-size: 11px;
`;

const ThalesAmount = styled(FlexDiv)`
    position: absolute;
    bottom: -25px;
    background-image: url(${ThalesAmountImage});
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
