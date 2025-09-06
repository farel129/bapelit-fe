export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit yang lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam yang lalu`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} hari yang lalu`;
    return date.toLocaleDateString('id-ID');
};