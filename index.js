const express = require('express')
const shortid= require('shortid')
const mongoose=require('mongoose')
const LongUrls=require('./models/long_url')
const createHttpError = require('http-errors')
const request=require('request')


const app = express()
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const port = 3000

app.use(express.json())


try{

    mongoose.connect('mongodb://localhost:27017',{
        dbName:'Url-Project',
        useNewUrlParser:true,
        useUnifiedTopology:true,
    },()=>
    {
        console.log("connected to db");  
    })
}
catch(e)
{
    console.log("DB connection error!!")
}
    
app.get('/', (req, res) => {
  res.send('Hello World!')
})


//  a long url will be shortened when this endpoint will be hit
app.post('/short', async (req, res) => {
    
    try
    {
        
    const url = req.body.url;
    if(!url)
    res.status(404).send("Provide a url to shorten!");

    const urlExists = await LongUrls.findOne({longUrl:url})
    

    // send the short id concatenated with the hostname and this will be copied by the user to access their main url
    if(urlExists)
    {
        // this is preferred when hosting
    // res.status(200).send(`http://${req.hostname}/${urlExists.shortUrl}`)


    res.status(200).send(`http://${req.headers.host}/${urlExists.shortUrl}`)
    return
    }

     let dummy=shortid.generate();
     let check = await LongUrls.findOne({shortUrl:dummy})
     if(check)
     dummy=shortid.generate();


     const longUrls=new LongUrls({longUrl:url, shortUrl: dummy})
     const result = await longUrls.save()
     res.send(`http://${req.headers.host}/${result.shortUrl}`);}

   catch(err)
   {
    next(err);
   }


  }) 

app.get('/:id',async (req,res,next)=>{

    console.log("okey")
    try
{
   const {id}=req.params
   const result= await LongUrls.findOne({shortUrl:id})
   console.log(result);
   if(result== null)
   {throw createHttpError.NotFound("url not exists anymore");
    

    }

   console.log("here")
   res.redirect(result.longUrl);
}

   catch(err)
   {
    console.log("hehhe")
    next(err);
   }


   

})

app.post('/expand',async (req,res,next)=>
{
try{

    let expand_it=req.body.shorturl;
    
    if(!expand_it.startsWith('http')) expand_it="https://"+expand_it;
    
    
    const options = {
        url: expand_it,
        method: 'GET',
        followAllRedirects:true
    };
    
    // Here we are expanding the url and checking the response url where the shorturl points to and just sending it back to the client side
    
    let expanded;
    request(options, function(err, response, body) {
        
        if(err)
        next(createHttpError.NotFound("url not found"));
        
        else{
            
            expanded=response.request.href;
            
            res.json({expanded})   
            console.log(response.request.href);
        }
    })
  
}
catch(err)
{
    
    next(err);
}

    
    
    
    
    
    
})



// Error Routes middleware


app.use((req,res,next)=>
{
    next(createHttpError.NotFound("hey bud this is an error🗿"));
})
app.use((err,req,res,next)=>
{
res.status(err.status || 500)
res.json(err.message || {"error":"Sorry for the inconvenience"});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})