import http from './httpService';

const apiEndpoint = '/announcements';

/**
 * helper methods for announcements API endpoint, all crud operations are available on this file,
 * Decalre a custom one if needed,
 * export it using default
 */

// hits api/announcements/
export function getAllAnnouncements({ pageSize = 20, page = 0 } = {}) {
  return http.get(`${apiEndpoint}?pageSize=${pageSize}&page=${page}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

// hits api/announcements/me
export function getAllAnnouncementsByUser({ pageSize = 5, page = 0 } = {}) {
  return http.get(`${apiEndpoint}/me?pageSize=${pageSize}&page=${page}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}
// hits api/announcements/:id
export function getSingleAnnouncement(announId) {
  return http.get(`${apiEndpoint}/${announId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}
// hits api/announcements/
export function postAnnouncement(objAnnounce) {
  return http.post(`${apiEndpoint}`, objAnnounce, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}
// hits api/announcements/:id
export function putAnnouncement(objAnnounce) {
  const body = { ...objAnnounce };
  delete body.id;
  return http.put(`${apiEndpoint}/${objAnnounce.id}`, body, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}
// hits api/announcements/:id
export function deleteAnnouncement(announceId) {
  return http.delete(`${apiEndpoint}/${announceId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('x-auth-token')}` }
  });
}

export default {
  getAllAnnouncements,
  getSingleAnnouncement,
  postAnnouncement,
  putAnnouncement,
  deleteAnnouncement
};
