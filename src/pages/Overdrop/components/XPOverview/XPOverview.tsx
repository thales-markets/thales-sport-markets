import TestBadge from 'assets/images/overdrop/test.png';
import React from 'react';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';
import ProgressLine from '../ProgressLine';

const XPOverview: React.FC = () => {
    return (
        <Wrapper>
            <Badge src={TestBadge} />
            <ProgressOverviewWrapper>
                <InfoWrapper>
                    <InfoItem>
                        <Label>{'Semi-Pro'}</Label>
                        <Value>{'#420'}</Value>
                    </InfoItem>
                    <InfoItem>
                        <Label>{'my total XP'}</Label>
                        <Value>{'87,432.28 XP'}</Value>
                    </InfoItem>
                </InfoWrapper>
                <ProgressLine progress={65} currentPoints={7374} nextLevelPoints={8000} level={6} />
            </ProgressOverviewWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    padding: 18.5px;
    border-radius: 6px;
    flex-direction: row;
    border: 3px solid transparent;
    border-radius: 6px;
    background: linear-gradient(${(props) => props.theme.background.quinary} 0 0) padding-box,
        linear-gradient(40deg, rgba(92, 68, 44, 1) 0%, rgba(23, 25, 42, 1) 50%, rgba(92, 68, 44, 1) 100%) border-box;
    position: relative;
    align-items: center;
    height: 120px;
`;

const ProgressOverviewWrapper = styled(FlexDivColumn)``;

const InfoWrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: space-between;
`;

const InfoItem = styled(FlexDivColumn)`
    align-items: flex-start;
`;

const Label = styled.span`
    text-transform: uppercase;
    font-weight: 300;
    font-size: 17px;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
`;

const Value = styled.span<{ highlight?: boolean }>`
    font-weight: 800;
    font-size: 17px;
    line-height: 20px;
    color: ${(props) => (props.highlight ? props.theme.textColor.primary : props.theme.textColor.primary)};
`;

const Badge = styled.img`
    width: 190px;
    height: 190px;
`;

export default XPOverview;
