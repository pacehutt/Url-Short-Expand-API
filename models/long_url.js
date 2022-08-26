const mongoose=require('mongoose')
const Schema = mongoose.Schema

const Long_url_schema=new Schema({

    longUrl:{
        type:String,
        required:true,
    },
    shortUrl:{
   type:String,
   required:true,
    }

})


module.exports = mongoose.model("longUrls",Long_url_schema);