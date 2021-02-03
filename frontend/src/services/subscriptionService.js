import http from './httpService';

const apiEndpoint = '/subscriptions';

export function getAllSubscriptions() {
  return http.get(`${apiEndpoint}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function getFilterData(queryObj) {
  const { tagName, authorName, authStatus, tagStatus } = queryObj;
  if (authorName && tagName) {
    return http.get(`${apiEndpoint}?${tagStatus}=${tagName}&${authStatus}=${authorName}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
    });
  }
  if (tagName) {
    return http.get(`${apiEndpoint}?${tagStatus}=${tagName}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
    });
  }
  if (authorName) {
    return http.get(`${apiEndpoint}?${authStatus}=${authorName}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
    });
  }
}

export function getSingleSubcription(subscribeId) {
  return http.get(`${apiEndpoint}/${subscribeId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function postSubscription(objSubscribe) {
  return http.post(`${apiEndpoint}`, objSubscribe, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function putSubscription(objSubscribe) {
  const body = { ...objSubscribe };
  return http.put(`${apiEndpoint}/${objSubscribe.id}`, body, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function deleteSubscription(subscribeId) {
  return http.delete(`${apiEndpoint}/${subscribeId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export default {
  getAllSubscriptions,
  getSingleSubcription,
  postSubscription,
  putSubscription,
  deleteSubscription
};
