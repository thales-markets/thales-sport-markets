import styled from 'styled-components';
import { FlexDiv, FlexDivColumn } from 'styles/common';

export const Container = styled(FlexDiv)`
    position: fixed;
    bottom: 3%;
    width: 90%;
    left: 50%;
    transform: translateX(-50%);
    height: 43px;
    color: black;
    background: linear-gradient(101.62deg, #64d9fe 14.92%, #a38cff 94.73%);
    border-radius: 40px;
    justify-content: space-around;
`;

export const ItemContainer = styled(FlexDiv)`
    justify-content: center;
    align-self: center;
`;

export const ItemIcon = styled.i`
    font-size: 33px;
    color: black;
`;

export const ParlayButton = styled.button`
    width: 33px;
    height: 33px;
    background: black;
    border-radius: 50px;
    border: none;
    color: #94c5f2;
    font-weight: 800;
    line-height: 31px;
    font-size: 27px;
`;

export const DropdownContainer = styled.div`
    position: absolute;
    width: 180px;
    left: 20px;
    bottom: 146px;
    z-index: 1000;
`;

export const DropDown = styled(FlexDivColumn)`
    border: 1px solid ${(props) => props.theme.input.borderColor.secondary};
    background: #252940;
    color: white;
    border-radius: 5px;
    position: absolute;
    margin-top: 2px;
    padding: 4px;
    width: 100%;
`;

export const DropDownItem = styled(FlexDiv)`
    padding: 7px 10px 9px 10px;
    cursor: pointer;
    &:hover {
        background: #5f6180;
        border-radius: 5px;
    }
`;

export const Label = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    color: white;
    display: block;
    text-transform: capitalize;
`;
