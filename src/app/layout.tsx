import type { Metadata } from 'next';import './globals.css';import { Toaster } from 'sonner';
export const metadata: Metadata={title:'RKNexora ERP',description:'Internship ERP System'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<Toaster richColors position="top-right"/></body></html>}