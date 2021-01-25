import http from './httpService';

const apiEndpoint = '/emailsends';

export function postSendEmail(objSubscribe) {
    return http.post(`${apiEndpoint}`, objSubscribe, {
        headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` },
    });
}

export default {
    postSendEmail,
};
