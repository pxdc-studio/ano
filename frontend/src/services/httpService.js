import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

function setJwt(jwt) {
    axios.defaults.headers.common['x-auth-token'] = jwt;
}

export default {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete,
    setJwt,
};
