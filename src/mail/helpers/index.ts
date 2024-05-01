export const parseImageURL = (path: string) => {
    const APP_URL = process.env.APP_URL;
    if (!path) {
        return `${APP_URL}/icons/profile.png`;
    }
    if (typeof path !== 'string') return path;
    const avatarRaw = path;
    const slugs = avatarRaw.split('://');
    const protocol = slugs[0];

    switch (protocol) {
        case 'https':
            return avatarRaw;
        default:
            return `${APP_URL}/api/storage/download?cid=${avatarRaw}`;
    }
};

export const cdnUrl = (path: string) => {
    const APP_URL = process.env.APP_URL;
    if (!path) {
        return `${APP_URL}/icons/profile.png`;
    }
    if (typeof path !== 'string') return path;
    const avatarRaw = path;
    const slugs = avatarRaw.split('://');
    const protocol = slugs[0];

    switch (protocol) {
        case 'https':
            return avatarRaw;
        default:
            return `${APP_URL}/api/storage/download?cid=${avatarRaw}`;
    }
};

export const upperCase = (s: string) => {
    return s.toUpperCase();
};

export const formatPrice = (num: number) => {
    return (num / 100).toFixed(2);
};

export function join(array, sep, options) {
    return array
        .map(function (item) {
            return options.fn(item);
        })
        .join(sep);
}

export function parseUnSubscribeUrl(path: string) {
    const APP_URL = process.env.APP_URL;
    return `${APP_URL}/${path}`;
}

