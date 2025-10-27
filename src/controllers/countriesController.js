const { Op } = require('sequelize');
const { sequelize, Country, Metadata } = require('../models');
const { refreshAllCountries } = require('../services/refreshService');
const { imageExists, getImagePath } = require('../services/imageService');
const { fetchCountries } = require('../services/externalApis');

function validationError(details) {
  return { error: 'Validation failed', details };
}

module.exports = {
  async refresh(req, res) {
    try {
      const result = await refreshAllCountries();
      return res.json({ success: true, total_countries: result.total, last_refreshed_at: result.last_refreshed_at });
    } catch (err) {
      if (err.code === 'countries_api_error' || err.code === 'exchange_api_error' || err.message?.includes('Could not fetch')) {
        return res.status(503).json({ error: 'External data source unavailable', details: err.message });
      }
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async list(req, res) {
    try {
      const { region, currency, sort } = req.query;
      const where = {};
      if (region) where.region = region;
      if (currency) where.currency_code = currency;

      const order = [];
      if (sort === 'gdp_desc') order.push(['estimated_gdp', 'DESC']);
      if (sort === 'gdp_asc') order.push(['estimated_gdp', 'ASC']);

      const countries = await Country.findAll({ where, order });
      return res.json(countries);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getOne(req, res) {
    try {
      const name = req.params.name;
      const country = await Country.findOne({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), name.toLowerCase())
      });
      if (!country) return res.status(404).json({ error: 'Country not found' });
      return res.json(country);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req, res) {
    try {
      const name = req.params.name;
      const country = await Country.findOne({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), name.toLowerCase())
      });
      if (!country) return res.status(404).json({ error: 'Country not found' });
      await country.destroy();
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async status(req, res) {
    try {
      const total = await Country.count();
      const meta = await Metadata.findByPk('last_refreshed_at');
      const last_refreshed_at = meta ? meta.value : null;
      return res.json({ total_countries: total, last_refreshed_at });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getImage(req, res) {
    try {
      if (!imageExists()) return res.status(404).json({ error: 'Summary image not found' });
      const imagePath = getImagePath();
      return res.sendFile(require('path').resolve(imagePath));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};