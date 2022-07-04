import styled from 'styled-components';

export const Container = styled.div`
    display: flex;
    flex-direction: row;
    margin: 13px 0px;
    padding: 0px 8px;
    justify-content: space-between;
    align-items: center;
`;

export const LabelValueContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Label = styled.span`
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    color: var(--table-header-text-color);
    text-transform: uppercase;
`;

export const CollateralName = styled.span`
    font-weight: 600;
    font-size: 21px;
    line-height: 25px;
    color: var(--primary-color);
    text-transform: uppercase;
`;

export const AssetContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export const CollateralIcon = styled.div<{ active?: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-left: 10px;
    box-shadow: ${(_props) => (_props?.active ? 'var(--shadow)' : '')};
    cursor: pointer;
`;
