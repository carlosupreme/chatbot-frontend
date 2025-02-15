import { Link, useRouter } from '@tanstack/react-router'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { CreditsDisplay } from '@/components/credits-display.tsx'
import { authService } from '@/features/auth/AuthService.ts'
import { UserData } from '@/features/auth/types.ts'
import { ThemeSwitch } from '@/components/theme-switch.tsx'

export function NavUser({ user }: { user: UserData }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const logout = () => {
    authService.logout()
    router.navigate({ to: '/iniciar-sesion', replace: true })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage
                  src={user.logo}
                  alt={user.name}
                  className='object-cover'
                />
                <AvatarFallback className='rounded-lg'>U</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{user.name}</span>
                <span className='truncate text-xs'>Plan {user.plan.name}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={user.logo}
                    alt={user.name}
                    className='object-cover'
                  />
                  <AvatarFallback className='rounded-lg'>U</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <span className='truncate text-xs'>
                    Plan {user.plan.name}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to='/settings/account'>
                  <CreditsDisplay
                    total={user.plan.totalMessages}
                    remaining={user.plan.leftMessages}
                  />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className='flex w-full justify-between items-center font-xs'>
                  <p>Tema</p>
                  <ThemeSwitch />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings/account'>
                  <BadgeCheck />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  <CreditCard />
                  Plan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings/notifications'>
                  <Bell />
                  Notificaciones
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
