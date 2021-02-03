import http from './httpService';

const apiEndpoint = '/resources';

export function getAllResources({ pageSize = 20, page = 0 } = {}) {
  return http.get(`${apiEndpoint}?pageSize=${pageSize}&page=${page}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function getResourceAutocomplete(slug) {
  return http.get(`${apiEndpoint}/find/${slug}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function getSingleResource(rescourceId) {
  return http.get(`${apiEndpoint}/${rescourceId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function postResource(objResource) {
  return http.post(`${apiEndpoint}`, objResource, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function putResource(objResource) {
  const body = { ...objResource };
  delete body.id;
  return http.put(`${apiEndpoint}/${objResource.id}`, body, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function deleteResource(rescourceId) {
  return http.delete(`${apiEndpoint}/${rescourceId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export default {
  getAllResources,
  getSingleResource,
  postResource,
  putResource,
  deleteResource
};
