import jwtDecode from 'jwt-decode';
import http from './httpService';

const apiEndpoint = '/auth/local';
const tokenKey = 'x-auth-token';
const userData = 'user';

/**
 * helper methods for auth API endpoint,
 */

// hits api/auth/local/register
export async function registerUser(userInfoObj) {
    const response = await http.post(`${apiEndpoint}/register`, userInfoObj);
    const {
        data: { jwt, user },
    } = response;
    await localStorage.setItem(tokenKey, jwt); // stores token in local storage named "x-auth-token"
    await localStorage.setItem(userData, JSON.stringify(user));
    return response;
}
// hits api/auth/local/
export async function loginUser(userInfoObj) {
    const response = await http.post(`${apiEndpoint}`, userInfoObj);
    const { data: { jwt, user }, } = response;
    await localStorage.setItem(tokenKey, jwt);
    await localStorage.setItem(userData, JSON.stringify(user));
    return response;
}
// retrives user token named "x-auth-token"
export function getCurrentUser() {
    try {
        const jwt = localStorage.getItem(tokenKey);
        return jwtDecode(jwt);
    } catch {
        return null;
    }
}
// removes token, user gets logout out
export function logout() {
    localStorage.removeItem(tokenKey);
}

export default {
    registerUser,
    loginUser,
    getCurrentUser,
    logout,
};
