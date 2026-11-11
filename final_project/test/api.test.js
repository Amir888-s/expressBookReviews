const {test}=require('node:test');
const assert=require('node:assert/strict');
const app=require('../index');
test('catalogue, authentication, review lifecycle and ownership',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 async function call(path,method='GET',body,cookie){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 try{
  assert.equal(Object.keys((await call('/')).data).length,10);
  assert.equal((await call('/isbn/1')).data.title,'Things Fall Apart');
  assert.equal(Object.keys((await call('/author/Unknown')).data).length,4);
  assert.equal((await call('/title/Pride%20and%20Prejudice')).data['8'].author,'Jane Austen');
  assert.equal((await call('/isbn/999')).status,404);
  assert.deepEqual((await call('/review/1')).data,{});
  assert.equal((await call('/customer/auth/review/1','PUT',{review:'x'})).status,401);
  for(const username of ['alice','bob'])assert.equal((await call('/register','POST',{username,password:'TestPass123!'})).status,201);
  assert.equal((await call('/register','POST',{username:'alice',password:'TestPass123!'})).status,409);
  assert.equal((await call('/customer/login','POST',{username:'alice',password:'wrongpass'})).status,401);
  const alice=(await call('/customer/login','POST',{username:'alice',password:'TestPass123!'})).cookie;
  const bob=(await call('/customer/login','POST',{username:'bob',password:'TestPass123!'})).cookie;
  assert.ok(alice);assert.ok(bob);
  assert.equal((await call('/customer/auth/review/1','PUT',{review:'First'},alice)).data.reviews.alice,'First');
  await call('/customer/auth/review/1','PUT',{review:'Other'},bob);
  assert.equal((await call('/customer/auth/review/1','PUT',{review:'Updated'},alice)).data.reviews.alice,'Updated');
  await call('/customer/auth/review/1','DELETE',undefined,alice);
  assert.deepEqual((await call('/review/1')).data,{bob:'Other'});
  assert.equal((await call('/customer/auth/review/1','DELETE',undefined,alice)).status,404);
  await call('/customer/auth/review/1','DELETE',undefined,bob);
  const parallel=await Promise.all(Array.from({length:20},()=>call('/')));
  assert.ok(parallel.every(r=>r.status===200));
 }finally{await new Promise(r=>server.close(r));}
});
