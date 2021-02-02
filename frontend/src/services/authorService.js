import http from './httpService';

const apiEndpoint = '/authors';

export function getAuthorsAutocomplete(slug) {
  return http.get(`${apiEndpoint}/find/${slug}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function getAllAuthors() {
  return http.get(`${apiEndpoint}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function getSingleAuthor(authorId) {
  return http.get(`${apiEndpoint}/${authorId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function postAuthor(objAuthor) {
  return http.post(`${apiEndpoint}`, objAuthor, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function putAuthor(objAuthor) {
  const body = { ...objAuthor };
  delete body.id;
  return http.put(`${apiEndpoint}/${objAuthor.id}`, body, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function deleteAuthor(authorId) {
  return http.delete(`${apiEndpoint}/${authorId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export default {
  getAllAuthors,
  getSingleAuthor,
  postAuthor,
  putAuthor,
  deleteAuthor
};
