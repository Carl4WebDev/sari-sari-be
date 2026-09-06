import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import AuthService from './AuthService.js';
const password_hash=await bcrypt.hash('Password123',4);
function fixture(is_admin){
  let sessions=0,jwts=0;
  const repo={findByEmail:async()=>({user_id:7,email:'account@example.com',store_name:'Account',is_admin,password_hash}),createAdminSession:async()=>{sessions++;return 'admin-session';}};
  const tokenService={generateToken:()=>{jwts++;return 'customer-token';}};
  return {service:new AuthService(repo,tokenService),counts:()=>({sessions,jwts})};
}
test('shared login returns a revocable admin session for an admin account',async()=>{
  const f=fixture(true);const result=await f.service.login({email:'account@example.com',password:'Password123'});
  assert.equal(result.token,'admin-session');assert.equal(result.user.role,'ADMIN');assert.deepEqual(f.counts(),{sessions:1,jwts:0});
});
test('shared login returns a customer token for a customer account',async()=>{
  const f=fixture(false);const result=await f.service.login({email:'account@example.com',password:'Password123',is_admin:true});
  assert.equal(result.token,'customer-token');assert.equal(result.user.role,'USER');assert.deepEqual(f.counts(),{sessions:0,jwts:1});
});
test('wrong password creates neither session nor customer token',async()=>{
  const f=fixture(true);await assert.rejects(()=>f.service.login({email:'account@example.com',password:'Wrong123'}));
  assert.deepEqual(f.counts(),{sessions:0,jwts:0});
});
