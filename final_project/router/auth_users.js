const express=require('express');
const jwt=require('jsonwebtoken');
const {randomBytes,scryptSync,timingSafeEqual}=require('node:crypto');
const books=require('./booksdb');
const router=express.Router();
const users=new Map();
const secret=process.env.JWT_SECRET||randomBytes(32).toString('hex');
const isValid=username=>users.has(username);
const valid=b=>typeof b?.username==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(b.username)&&typeof b.password==='string'&&b.password.length>=8&&b.password.length<=256;
function register(req,res){
 if(!valid(req.body))return res.status(400).json({message:'Use a username of 1-64 letters, digits, underscores or hyphens and a password of 8-256 characters'});
 if(isValid(req.body.username))return res.status(409).json({message:'User already exists'});
 const salt=randomBytes(16).toString('hex');
 users.set(req.body.username,{salt,hash:scryptSync(req.body.password,salt,64)});
 return res.status(201).json({message:'User successfully registered. Now you can login'});
}
router.post('/login',(req,res,next)=>{
 if(!valid(req.body))return res.status(401).json({message:'Invalid username or password'});
 const user=users.get(req.body.username);
 if(!user||!timingSafeEqual(user.hash,scryptSync(req.body.password,user.salt,64)))return res.status(401).json({message:'Invalid username or password'});
 req.session.regenerate(err=>{
  if(err)return next(err);
  req.session.authorization={accessToken:jwt.sign({username:req.body.username},secret,{expiresIn:'1h'})};
  req.session.save(err=>err?next(err):res.json({message:'User successfully logged in'}));
 });
});
router.use('/auth',(req,res,next)=>{
 try{req.username=jwt.verify(req.session.authorization?.accessToken,secret).username;if(!users.has(req.username))throw Error();next();}
 catch{res.status(401).json({message:'Please login to perform this action'});}
});
router.put('/auth/review/:isbn',(req,res)=>{
 const book=books[req.params.isbn];
 if(!book)return res.status(404).json({message:'Book not found'});
 const review=req.body?.review??req.query.review;
 if(typeof review!=='string'||!review.trim()||review.length>5000)return res.status(400).json({message:'Provide a review of 1-5000 characters'});
 const updated=Object.hasOwn(book.reviews,req.username);
 Object.defineProperty(book.reviews,req.username,{value:review.trim(),enumerable:true,configurable:true,writable:true});
 return res.json({message:updated?'Review successfully updated':'Review successfully added',reviews:book.reviews});
});
router.delete('/auth/review/:isbn',(req,res)=>{
 const book=books[req.params.isbn];
 if(!book)return res.status(404).json({message:'Book not found'});
 if(!Object.hasOwn(book.reviews,req.username))return res.status(404).json({message:'You have no review for this book'});
 delete book.reviews[req.username];
 return res.json({message:'Review successfully deleted',reviews:book.reviews});
});
module.exports={authenticated:router,isValid,users,register};
