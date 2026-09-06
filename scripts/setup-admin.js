import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import bcrypt from 'bcrypt';
import db from '../src/core/database/db.js';
import {validateAccount} from '../src/modules/admin/validation.js';

// Run locally: node scripts/setup-admin.js --email you@example.com
// Existing users keep their password; new users choose one privately in the terminal.
const args=process.argv.slice(2);
let muted=false;
const output=new Writable({write(chunk,encoding,callback){if(!muted)process.stdout.write(chunk,encoding);callback();}});
const prompt=createInterface({input:process.stdin,output,terminal:true});
try {
  const emailArg=args.indexOf('--email');
  const email=(emailArg>=0?args[emailArg+1]:await prompt.question('Administrator email: '))?.trim().toLowerCase();
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid administrator email.');
  const existing=await db.query('SELECT user_id,is_admin,deleted_at FROM users WHERE email=$1',[email]);
  if(existing.rows[0]?.deleted_at)throw new Error('Restore this account before assigning administrator access.');
  if(existing.rows.length){
    if(!existing.rows[0].is_admin){
      const confirm=await prompt.question(`Grant administrator access to ${email}? Type YES: `);
      if(confirm!=='YES')throw new Error('No changes made.');
      await db.query('UPDATE users SET is_admin=true,updated_at=now() WHERE user_id=$1',[existing.rows[0].user_id]);
    }
    console.log('Administrator account is ready. Sign in with its existing password at /login.');
  }else{
    const name=await prompt.question('Administrator name: ');
    process.stdout.write('Choose password (hidden): ');muted=true;
    const password=await prompt.question('');muted=false;process.stdout.write('\nConfirm password (hidden): ');muted=true;
    const confirm=await prompt.question('');muted=false;process.stdout.write('\n');
    if(password!==confirm)throw new Error('Passwords do not match. No account created.');
    const input=validateAccount({email,store_name:name,password},{passwordRequired:true});
    const hash=await bcrypt.hash(password,12);
    await db.query('INSERT INTO users(email,store_name,password_hash,is_admin) VALUES($1,$2,$3,true)',[input.email,input.name,hash]);
    console.log('Administrator created. Sign in at /login.');
  }
}catch(error){muted=false;console.error(error.code==='28P01'?'Database login failed. Correct the database credentials before setting up the administrator.':error.message);process.exitCode=1;}
finally{prompt.close();await db.end();}
