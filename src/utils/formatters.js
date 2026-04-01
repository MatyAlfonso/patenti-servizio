export const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("it-IT").format(date);
};

export const getFileUrl = (absolutePath) => {
    if (!absolutePath) return '';

    const normalized = absolutePath.replace(/\\/g, '/');

    return `app-file:///${normalized}`;
};