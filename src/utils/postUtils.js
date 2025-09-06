export const canEditPost = (post, user) => {
    // Hanya owner post yang bisa edit
    return post && user && post.user.id === user.id;
};

export const canDeletePost = (post, user) => {
    // Owner post atau admin bisa delete
    return post && user && (post.user.id === user.id || user.role === 'admin');
};