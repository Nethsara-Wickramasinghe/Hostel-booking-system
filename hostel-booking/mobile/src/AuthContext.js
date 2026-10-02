import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { setToken } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync('token');
        if (t) {
          setToken(t);
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        }
      } catch (e) {
        if (e.response?.status === 401) { await SecureStore.deleteItemAsync('token'); setToken(null); }
      }
      setReady(true);
    })();
  }, []);

  const save = async ({ token, user }) => {
    await SecureStore.setItemAsync('token', token);
    setToken(token);
    setUser(user);
  };
  const login = async (email, password) => save((await api.post('/auth/login', { email, password })).data);
  const register = async (body) => save((await api.post('/auth/register', body)).data);
  const logout = async () => { await SecureStore.deleteItemAsync('token'); setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}
