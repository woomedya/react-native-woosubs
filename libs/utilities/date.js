export const getUTCTime = (miliseconds = 0) => {
    return new Date(Date.now() + miliseconds).toISOString();
}