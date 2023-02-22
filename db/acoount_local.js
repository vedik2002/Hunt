const mongoose = require("mongoose")

const account_temp = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    password:{
      type: String,
      required: true,
      unique: true
    },

});

//const Mytemp_one = mongoose.model("MyModel",account_temp)

module.exports = account_temp;

//module.exports = Mytemp_one;