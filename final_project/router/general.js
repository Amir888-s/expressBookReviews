const express = require('express');
const axios = require('axios');
const books = require('./booksdb');
const {register} = require('./auth_users');
const router = express.Router();
router.post('/register', register);
router.get('/catalog/books', (req,res)=>res.json(books));
router.get('/catalog/isbn/:isbn', (req,res)=> books[req.params.isbn] ? res.json(books[req.params.isbn]) : res.status(404).json({message:'Book not found'}));
for (const field of ['author','title']) router.get(`/catalog/${field}/:value`, (req,res)=>{
 const matches=Object.fromEntries(Object.entries(books).filter(([,b])=>b[field].toLowerCase()===req.params.value.toLowerCase()));
 return Object.keys(matches).length ? res.json(matches) : res.status(404).json({message:'Book not found'});
});
const client=req=>axios.create({baseURL:`http://127.0.0.1:${req.socket.localPort}/catalog`,timeout:5000,proxy:false});
const fail=(res,e)=>res.status(e.response?.status||502).json(e.response?.data||{message:'Catalogue request failed'});
// Retrieve all books using async/await and Axios.
router.get('/',async(req,res)=>{try{res.json((await client(req).get('/books')).data);}catch(e){fail(res,e);}});
// Retrieve a book by ISBN using Axios promise callbacks.
router.get('/isbn/:isbn',(req,res)=>client(req).get(`/isbn/${encodeURIComponent(req.params.isbn)}`).then(r=>res.json(r.data)).catch(e=>fail(res,e)));
// Retrieve books by author and title using async/await and Axios.
for(const field of ['author','title']) router.get(`/${field}/:value`,async(req,res)=>{
 try{res.json((await client(req).get(`/${field}/${encodeURIComponent(req.params.value)}`)).data);}catch(e){fail(res,e);}
});
router.get('/review/:isbn',(req,res)=>books[req.params.isbn]?res.json(books[req.params.isbn].reviews):res.status(404).json({message:'Book not found'}));
module.exports.general=router;
