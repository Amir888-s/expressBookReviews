const express=require('express');
const session=require('express-session');
const {randomBytes}=require('node:crypto');
const app=express();
app.use(express.json({limit:'16kb'}));
app.use('/customer',session({secret:process.env.SESSION_SECRET||randomBytes(32).toString('hex'),resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',maxAge:3600000,secure:process.env.NODE_ENV==='production'}}));
app.use('/customer',require('./router/auth_users').authenticated);
app.use('/',require('./router/general').general);
app.use((req,res)=>res.status(404).json({message:'Route not found'}));
app.use((err,req,res,next)=>res.status(err.status||500).json({message:err.status===400?'Invalid JSON':'Request failed'}));
if(require.main===module){const port=process.env.PORT||5000;app.listen(port,'127.0.0.1',()=>console.log(`Bookstore running at http://127.0.0.1:${port}`));}
module.exports=app;
