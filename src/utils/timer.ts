export const delay = (interval: number) => {
    return new Promise((resolve) => setTimeout(resolve, interval));
};
