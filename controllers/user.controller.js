require('dotenv').config();
const Users = require('../models/users');
const Moment = require('moment-timezone');

module.exports = {
    getUser: async (req, res) => {
        console.log('GET_APP_ACCOUNT');

        try {
            let usersRaw = await Users.fetchAll();
            let users = JSON.parse(JSON.stringify(usersRaw));

            for (let i = 0; i < users.length; i++) {
                users[i].key = users[i].address;
                users[i].label = users[i].name;
                users[i].bottomLeftText = "0x" + users[i].address.substr(users[i].address.length - 6);
                users[i].topRightText = Moment(users[i].created_at).format('LL');
            }

            return res.json({
                users: users,
            })
        } catch (err) {
            console.log(err);
        }
    },
    postUser: async (req, res) => {
        console.log('POST_APP_ACCOUNT');

        const { address } = req.body;

        try {
            let saved = await Users.where('address', address).fetch();

            return res.json({ user: saved });
        } catch (err) {
            if (err.message == 'EmptyResponse') {
                let saved = await new Users({ 
                    address: address, 
                    chain: 'ethereum', 
                    name: 'Placeholder'
                }).save(); 

                return res.json({ user: saved });
            } else {
                console.log(err);
            }
        }
    },
    putUser: async (req, res) => {
        console.log('PUT_APP_ACCOUNTS');

        const { wallet, name } = req.body;

        try {
            const updated = await Users.where('address', wallet).fetch();

            const saved = await updated.save(
            {
                'name': name
            },{ 
                method: 'update'
            });

            return res.json({ saved });
        } catch (error) {
            console.log('Error: ', error.message);
            
            return res.json({ error });
        }
    },
}