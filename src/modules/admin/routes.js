import express from 'express';
import bcrypt from 'bcrypt';
import db from '../../core/database/db.js';
import adminAuth from './auth.js';
import {validateAccount,validatePassword} from './validation.js';

const router = express.Router();
router.use(adminAuth);
router.post('/logout',async(req,res) => {
  await db.query('DELETE FROM admin_sessions WHERE token_hash=$1',[req.adminTokenHash]);
  res.json({data:{signed_out:true}});
});
router.get('/profile',(req,res) => res.json({data:req.admin}));
router.patch('/profile',async(req,res) => {
  let input;
  try {input=validateAccount(req.body);} catch(e) {return res.status(400).json({message:e.message});}
  const user = await db.query('SELECT password_hash FROM users WHERE user_id=$1',[req.admin.user_id]);
  if (typeof req.body.current_password !== 'string' || !await bcrypt.compare(req.body.current_password,user.rows[0].password_hash)) return res.status(400).json({message:'Enter your current password to update your profile.'});
  try {
    const result = await db.query('UPDATE users SET store_name=$2,email=$3,updated_at=now() WHERE user_id=$1 RETURNING user_id,email,store_name,created_at',[req.admin.user_id,input.name,input.email]);
    res.json({data:result.rows[0]});
  } catch(e) {if(e.code==='23505') return res.status(409).json({message:'That email address is already in use.'});throw e;}
});
router.patch('/profile/password',async(req,res) => {
  try {validatePassword(req.body.new_password);} catch(e) {return res.status(400).json({message:e.message});}
  const user = await db.query('SELECT password_hash FROM users WHERE user_id=$1',[req.admin.user_id]);
  if (typeof req.body.current_password !== 'string' || !await bcrypt.compare(req.body.current_password,user.rows[0].password_hash)) return res.status(400).json({message:'Current password is incorrect.'});
  const password = await bcrypt.hash(req.body.new_password,12);
  await db.transaction(async client => {
    await client.query('UPDATE users SET password_hash=$2,updated_at=now() WHERE user_id=$1',[req.admin.user_id,password]);
    await client.query('DELETE FROM admin_sessions WHERE user_id=$1',[req.admin.user_id]);
  });
  res.json({data:{signed_out:true}});
});
router.get('/customers',async(req,res) => {
  const result = await db.query('SELECT user_id,email,store_name,created_at,deleted_at FROM users WHERE NOT is_admin ORDER BY created_at DESC');
  res.json({data:result.rows});
});
router.post('/customers',async(req,res) => {
  let input;
  try {input=validateAccount(req.body,{passwordRequired:true});} catch(e) {return res.status(400).json({message:e.message});}
  const password = await bcrypt.hash(req.body.password,12);
  try {
    const result = await db.query('INSERT INTO users(email,store_name,password_hash) VALUES($1,$2,$3) RETURNING user_id,email,store_name,created_at,deleted_at',[input.email,input.name,password]);
    res.status(201).json({data:result.rows[0]});
  } catch(e) {if(e.code==='23505') return res.status(409).json({message:'That email address is already in use, including deleted accounts.'});throw e;}
});
router.param('id',(req,res,next,id) => {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id)<1) return res.status(400).json({message:'Invalid customer ID.'});
  next();
});
router.patch('/customers/:id',async(req,res) => {
  let input;
  try {input=validateAccount(req.body);} catch(e) {return res.status(400).json({message:e.message});}
  try {
    const result = await db.query('UPDATE users SET store_name=$2,email=$3,updated_at=now() WHERE user_id=$1 AND NOT is_admin AND deleted_at IS NULL RETURNING user_id,email,store_name,created_at,deleted_at',[req.params.id,input.name,input.email]);
    if(!result.rows.length) return res.status(404).json({message:'Active customer not found.'});
    res.json({data:result.rows[0]});
  } catch(e) {if(e.code==='23505') return res.status(409).json({message:'That email address is already in use.'});throw e;}
});
router.delete('/customers/:id',async(req,res) => {
  const result = await db.query('UPDATE users SET deleted_at=now(),updated_at=now() WHERE user_id=$1 AND NOT is_admin AND deleted_at IS NULL RETURNING user_id',[req.params.id]);
  if(!result.rows.length) return res.status(404).json({message:'Active customer not found.'});
  res.json({data:{deleted:true}});
});
router.post('/customers/:id/restore',async(req,res) => {
  const result = await db.query('UPDATE users SET deleted_at=NULL,updated_at=now() WHERE user_id=$1 AND NOT is_admin AND deleted_at IS NOT NULL RETURNING user_id',[req.params.id]);
  if(!result.rows.length) return res.status(404).json({message:'Deleted customer not found.'});
  res.json({data:{restored:true}});
});
export default router;
