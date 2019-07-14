import axios from 'axios';

export const fetchPlayers = () => {
    return axios.get('/api/players')
};

export const fetchPlayer = data => {
    return axios.post('/api/players', data)
}

export const destroyPlayer = data => {
    return axios.delete('/api/player', data)
}