import axios from 'axios';import {useAuthStore} from '@/store/auth-store';
export const api=axios.create({baseURL:process.env.NEXT_PUBLIC_API_URL??'http://localhost:5000/api',withCredentials:true,timeout:30000});
api.interceptors.request.use(c=>{const t=useAuthStore.getState().accessToken;if(t)c.headers.Authorization=`Bearer ${t}`;return c});
api.interceptors.response.use(r=>r,async e=>{if(e.response?.status===401){useAuthStore.getState().logout()}return Promise.reject(e)});