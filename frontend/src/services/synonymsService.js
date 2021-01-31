import http from './httpService';

const apiEndpoint = '/synonyms';

export function getAllSynonyms({ pageSize = 5, page = 1 } = {}) {
  return http.get(`${apiEndpoint}/?pageSize=${pageSize}&page=${page}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function getSingleSynonym(synonymId) {
  return http.get(`${apiEndpoint}/${synonymId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function postSynonym(objSynonym) {
  return http.post(`${apiEndpoint}`, objSynonym, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function putSynonyms(objSynonym) {
  const body = { ...objSynonym };
  delete body.id;
  return http.put(`${apiEndpoint}/${objSynonym.id}`, body, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export function deleteSynonym(synonymId) {
  return http.delete(`${apiEndpoint}/${synonymId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export default {
  getAllSynonyms,
  getSingleSynonym,
  postSynonym,
  putSynonyms,
  deleteSynonym
};
