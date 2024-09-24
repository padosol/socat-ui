import axios from 'axios';

const instance = axios.create({
  headers: {
    "Cache-Control": "no-cache",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  }
});

export default instance;