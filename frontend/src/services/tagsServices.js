import http from './httpService';

const apiEndpoint = '/tags';

export function getAllTags() {
    return http.get(`${apiEndpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` },
    });
}

export function getTagsByName(slug) {
    return http.get(`${apiEndpoint}/slug/${slug}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` },
    });
}

export function getSingleTag(rescourceId) {
    return http.get(`${apiEndpoint}/${rescourceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` },
    });
}

export function postTag(objResource) {
    return http.post(`${apiEndpoint}`, objResource, {
        headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` },
    });
}

export function putTag(objResource) {
    const body = { ...objResource };
    delete body.id;
    return http.put(`${apiEndpoint}/${objResource.id}`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` },
    });
}

export function deleteTag(tagId) {
    return http.delete(`${apiEndpoint}/${tagId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` },
    });
}

export default {
    getAllTags,
    getSingleTag,
    postTag,
    putTag,
    deleteTag,
};
