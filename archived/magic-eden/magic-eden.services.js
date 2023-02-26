const Axios = require('axios');

module.exports = {
    getCollectionActivites: async (symbol, max) => {
        let tmp = [], offset = 0, proceed = true;

        do {
            let activities = await Axios.get('https://api-mainnet.magiceden.dev/v2/collections/' + symbol + '/activities?offset=' + offset + '&limit=20');

            if (activities.data !== undefined && activities.data.length > 0) {
                tmp = tmp.concat(activities.data);

                offset = offset + 20;
            } else {
                proceed = false
            }
        } while (proceed && offset <= max);

        return tmp;
    }
}