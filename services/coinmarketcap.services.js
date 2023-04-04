require('dotenv').config();

const Axios = require('axios');

module.exports = {
  getCoinMarketCapCategories: async () => {
    let result = await Axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/categories', {
      'headers': {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
      }
    });

    let categories = result.data.data.sort((a,b) => {
      if (a.market_cap > b.market_cap) {
          return -1;
      } else if (a.market_cap < b.market_cap) {
          return 1;
      } else {
          return 0;
      }
    })

    return categories;
  },
  formatCoinMarketCapCategories: async (categories) => {
    for (let i = 0; i < categories.length; i++) {
      categories[i].marketCap = '$' + (categories[i].market_cap).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      categories[i].marketCapChange = categories[i].market_cap_change.toFixed(2) + '%';
      categories[i].marketVolume = '$' + (categories[i].volume).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      categories[i].marketVolumeChange = categories[i].volume_change.toFixed(2) + '%';
      categories[i].tokenAverageMarketCap = '$' + (categories[i].market_cap / categories[i].num_tokens).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    return categories;
  }
}