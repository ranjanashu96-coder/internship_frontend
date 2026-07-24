import {AuthGuard} from '@/components/auth-guard';
import {AppShell} from '@/components/app-shell';
export default function Layout({children}:{children:React.ReactNode})
{return <AuthGuard roles={['college_admin']}><AppShell role="college_admin">{children}</AppShell></AuthGuard>}