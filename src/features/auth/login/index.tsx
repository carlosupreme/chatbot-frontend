import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function Login() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='flex flex-col space-y-2 text-left'>
          <h1 className='text-2xl font-semibold tracking-tight'>Iniciar sesión</h1>
          <p className='text-sm text-muted-foreground'>Ingresa tu correo electrónico y contraseña a continuación</p>
        </div>
        <UserAuthForm />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          Al hacer clic en iniciar sesión, aceptas nuestros{' '}
          <a
            href='/terms'
            className='underline underline-offset-4 hover:text-primary'
          >
            Términos de Servicio
          </a>{' '}
          y nuestra{' '}
          <a
            href='/privacy'
            className='underline underline-offset-4 hover:text-primary'
          >
            Política de Privacidad
          </a>
          .
        </p>
      </Card>
    </AuthLayout>
  )
}