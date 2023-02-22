const mongoose = require("mongoose")


const account = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    point: {
      type: Number,
      required: true,
      default: 0
    },
    password:{
      type: String,
      required: true,
      unique: true
    },
    isOnline:{
      type:Boolean,
      required: true,
      default: false
    },

    arr:[{type:String}]
});

const MyModel = mongoose.model("mymodels",account)
//module.exports = account;
module.exports = MyModel;