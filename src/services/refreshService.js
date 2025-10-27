const { Country, Metadata, sequelize } = require('../models');
const { fetchCountries, fetchExchangeRates } = require('./externalApis');
const { randInt } = require('../utils/random');
const { generateSummaryImage } = require('./imageService');
const { Op } = require('sequelize');

async function refreshAllCountries() {
  // 1. Fetch external data
  let countriesRemote, exchangeData;
  try {
    [countriesRemote, exchangeData] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates()
    ]);
  } catch (err) {
    // Determine which API failed
    if (err.message === 'countries_api_error') {
      const e = new Error('Could not fetch data from Rest Countries API');
      e.code = 'countries_api_error';
      throw e;
    }
    if (err.message === 'exchange_api_error') {
      const e = new Error('Could not fetch data from Exchange Rates API');
      e.code = 'exchange_api_error';
      throw e;
    }
    throw err;
  }

  // Validate structure for exchange rates
  if (!exchangeData || !exchangeData.rates) {
    const e = new Error('Invalid exchange rates response');
    e.code = 'exchange_api_error';
    throw e;
  }
  const rates = exchangeData.rates; // mapping currency_code -> rate (relative to USD)

  // 2. Start transaction - we do not want partial updates if an error occurs
  const t = await sequelize.transaction();
  try {
    const now = new Date();

    for (const entry of countriesRemote) {
      const name = entry.name;
      const capital = entry.capital || null;
      const region = entry.region || null;
      const population = entry.population ?? 0;
      const flag_url = entry.flag || null;

      // currencies may be undefined or an array; take first code if exists
      let currency_code = null;
      if (Array.isArray(entry.currencies) && entry.currencies.length > 0 && entry.currencies[0] && entry.currencies[0].code) {
        currency_code = entry.currencies[0].code;
      }

      let exchange_rate = null;
      let estimated_gdp = null;

      if (!currency_code) {
        // rule: store country with currency code null, exchange_rate null, estimated_gdp = 0
        exchange_rate = null;
        estimated_gdp = 0;
      } else {
        // lookup rate
        const rate = rates[currency_code];
        if (rate === undefined || rate === null) {
          exchange_rate = null;
          estimated_gdp = null;
        } else {
          exchange_rate = Number(rate); // rate to USD
          const multiplier = randInt(1000, 2000);
          // estimated_gdp = population * multiplier ÷ exchange_rate
          // note: if exchange_rate is zero (shouldn't happen), handle gracefully
          if (exchange_rate === 0) {
            estimated_gdp = null;
          } else {
            estimated_gdp = (Number(population) * multiplier) / exchange_rate;
          }
        }
      }

      // Upsert: match by name case-insensitive
      const existing = await Country.findOne({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('name')),
          name.toLowerCase()
        ),
        transaction: t
      });

      const payload = {
        name,
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url,
        last_refreshed_at: now
      };

      if (existing) {
        await existing.update(payload, { transaction: t });
      } else {
        // Validate required fields for DB-level rules: name and population must exist
        // But note: incoming countries list always has name, population so we proceed
        await Country.create(payload, { transaction: t });
      }
    }

    // update metadata last_refreshed_at
    const key = 'last_refreshed_at';
    const value = new Date().toISOString();
    await Metadata.upsert({ key, value }, { transaction: t });

    // Commit transaction
    await t.commit();

    // After successful commit, generate image (outside transaction)
    // Get total and top 5
    const total = await Country.count();
    const top5 = await Country.findAll({
      where: { estimated_gdp: { [Op.ne]: null } },
      order: [['estimated_gdp', 'DESC']],
      limit: 5
    });

    await generateSummaryImage(total, top5.map(c => c.toJSON()), value);

    return { total, last_refreshed_at: value };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = { refreshAllCountries };