const mongoose = require("mongoose")

const ques = new mongoose.Schema({
    question:{
      type: String,
      required: true
    },
  
    code:{
      type : String,
      required: true,
    },
  
    score:{
      type: Number,
      required: true,
    },
  
});

//module.exports = ques;
const Hard = mongoose.model("Hard",ques);
module.exports = Hard;