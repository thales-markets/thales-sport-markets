export type OverdropMultiplier = {
    multiplier: number;
    name: string;
    label?: string;
    icon?: JSX.Element;
};

export type OverdropUserData = {
    address: string;
    points: number;
    volume: number;
};
