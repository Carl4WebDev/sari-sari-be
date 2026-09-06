import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAccount,validatePassword} from './validation.js';
import {hashToken,newToken} from './auth.js';
test('account input normalizes names and emails',()=>{
  assert.deepEqual(validateAccount({store_name:'  Store One  ',email:' CUSTOMER@EXAMPLE.COM '}),{name:'Store One',email:'customer@example.com'});
});
test('account validation rejects malformed input and weak initial passwords',()=>{
  for(const body of [{store_name:'',email:'a@b.com'},{store_name:'Store',email:'bad'},{store_name:'x'.repeat(101),email:'a@b.com'},{store_name:'Store',email:'a@b.com',password:'weak'}]){
    assert.throws(()=>validateAccount(body,{passwordRequired:true}));
  }
  assert.doesNotThrow(()=>validatePassword('StrongPassword9'));
  assert.throws(()=>validatePassword('StrongPassword9'+'x'.repeat(72)));
});
test('session tokens have entropy and are stored as a one-way digest',()=>{
  const first=newToken(),second=newToken();
  assert.match(first,/^[a-f0-9]{64}$/);assert.notEqual(first,second);
  assert.notEqual(first,hashToken(first));assert.equal(hashToken(first),hashToken(first));
});
