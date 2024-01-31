type PWAProps = {
    beforeInstallEvent: BeforeInstallEvent | null;
    setEvent: (installPromp: any) => void;
    disableBeforeInstallEvent: () => void;
};

type BeforeInstallEvent = Event & {
    prompt: any;
};

// @ts-ignore
const PWA: PWAProps = {
    setEvent: function (installPromp: any | null) {
        this.beforeInstallEvent = installPromp;
    },
    disableBeforeInstallEvent: function () {
        this.beforeInstallEvent = null;
    },
};

export default PWA;
