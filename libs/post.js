import Axios from "axios";

const post = async (baseURL, url, headers, data) => {
    var instance = Axios.create({
        baseURL: baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json', ...headers }
    });
    var responseJson = await instance.post(url, data);

    return responseJson.data
}

export default {
    post
}