const axios = require('axios');
require('dotenv').config();

const REST_URL = process.env.RESTCOUNTRIES_URL;
const EXCHANGE_URL = process.env.EXCHANGE_URL;

async function fetchCountries() {
  try {
    const res = await axios.get(REST_URL, { timeout: 15_000 });
    return res.data;
  } catch (err) {
    throw new Error('countries_api_error');
  }
}

async function fetchExchangeRates() {
  try {
    const res = await axios.get(EXCHANGE_URL, { timeout: 15_000 });
    // open.er-api returns structure with `rates` field when success
    return res.data;
  } catch (err) {
    throw new Error('exchange_api_error');
  }
}

module.exports = { fetchCountries, fetchExchangeRates };