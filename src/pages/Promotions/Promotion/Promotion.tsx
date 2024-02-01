import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

type PromotionProps = RouteComponentProps<{
    promotionId: string;
}>;

const Promotion: React.FC<PromotionProps> = (props) => {
    const promotionId = props?.match?.params?.promotionId;
    console.log('promotionId ', promotionId);

    return <></>;
};

export default Promotion;
