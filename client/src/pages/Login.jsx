import React from 'react';
import { useState } from 'react';
import { login, register } from '../api/auth';

export default function Login(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [mode,setMode] = useState('login');

  async function submit(e){
    e.preventDefault();
    const fn = mode === 'login' ? login : register;
    const res = await fn(email, password);
    if (res.token) {
      localStorage.setItem('token', res.token);
      alert('Logged in');
    } else {
      alert(JSON.stringify(res));
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Submit</button>
      <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')}>
        Switch to {mode==='login'?'Register':'Login'}
      </button>
    </form>
  );
}
