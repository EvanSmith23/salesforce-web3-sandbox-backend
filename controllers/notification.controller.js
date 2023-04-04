

module.exports = {
  POST_NOTIFICATION_FROM_ALCHEMY: async (req,res) => {
    console.log(req.body);
    console.log(req.body.event);

    return res.send('RESPONSE: GET_NOTIFICATION_FROM_ALCHEMY');
  }
}