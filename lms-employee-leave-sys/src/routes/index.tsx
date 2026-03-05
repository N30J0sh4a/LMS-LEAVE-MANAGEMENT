import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Card } from '../components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../components/ui/input-group'
import { Chrome, Eye, EyeOff } from 'lucide-react'
import { Field, FieldGroup, FieldLabel } from '../components/ui/field'
import { Checkbox } from '../components/ui/checkbox'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { toast } from 'sonner'

import { auth, googleProvider } from '../lib/firebase'
import { loginUserSession, type UserRole } from '../lib/auth-api'
import { saveUserProfile } from '../lib/session'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<UserRole>('employee')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.title = 'Sign in'
  }, [])

  const navigateByRole = async (userRole: UserRole) => {
    await navigate({ to: userRole === 'employee' ? '/employee' : '/manager' })
  }

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error('Email and password are required.')
      return
    }

    try {
      setIsLoading(true)
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()
      const userProfile = await loginUserSession(idToken, { role, autoCreate: false })
      saveUserProfile(userProfile)
      toast.success('Signed in successfully.')
      await navigateByRole(userProfile.role)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const credential = await signInWithPopup(auth, googleProvider)
      const idToken = await credential.user.getIdToken()
      const userProfile = await loginUserSession(idToken, {
        role,
        autoCreate: true,
        fullName: credential.user.displayName || undefined,
      })
      saveUserProfile(userProfile)
      toast.success('Google sign in successful.')

      await navigateByRole(userProfile.role)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in with Google.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#F4F6F9] relative overflow-hidden">
      <section className="hidden md:flex md:w-1/2 relative text-white flex-col justify-center px-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D3142] via-[#1A5FD7] to-[#2D3142]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#F26327_0%,transparent_40%)] opacity-20" />

        <div className="relative z-10">
          <img src="./logo-32x32.png" alt="logo" className="w-14 mb-8 rounded-lg" />

          <h1 className="text-4xl font-semibold leading-tight mb-6">
            Enterprise Leave Portal
          </h1>

          <p className="text-[#BFC0C0] text-lg max-w-md leading-relaxed">
            A secure and centralized leave management platform designed
            for structured organizations and professional teams.
          </p>

          <div className="mt-10 text-sm text-[#BFC0C0]">
            Trusted internal HR system - Secure - Reliable
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12 relative">
        <div className="absolute top-8 md:hidden">
          <img src="./logo-32x32.png" alt="logo" className="w-12 rounded-lg mx-auto" />
        </div>

        <Card className="w-full max-w-md p-10 rounded-2xl shadow-2xl border border-[#E6E8EC] bg-white">
          <div className="text-center mb-5">
            <h2 className="text-3xl font-semibold text-[#2D3142]">
              Sign in
            </h2>
            <p className="text-sm text-[#BFC0C0] mt-2">
              Access your secure dashboard
            </p>
          </div>

          <div className="flex mb-8 border-b border-[#E6E8EC]">
            <button
              onClick={() => setRole('employee')}
              className={`flex-1 pb-3 text-sm font-medium transition ${role === 'employee'
                ? 'border-b-2 border-[#1A5FD7] text-[#1A5FD7]'
                : 'text-[#BFC0C0]'
                }`}
            >
              Employee
            </button>

            <button
              onClick={() => setRole('manager')}
              className={`flex-1 pb-3 text-sm font-medium transition ${role === 'manager'
                ? 'border-b-2 border-[#1A5FD7] text-[#1A5FD7]'
                : 'text-[#BFC0C0]'
                }`}
            >
              Manager
            </button>
          </div>

          <FieldGroup className="space-y-6">
            <Field orientation="vertical">
              <FieldLabel className="text-[#2D3142] font-medium">
                Company Email
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type="email"
                  placeholder="you@company.com"
                  className="focus:ring-2 focus:ring-[#1A5FD7]"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </InputGroup>
            </Field>

            <Field orientation="vertical">
              <FieldLabel className="text-[#2D3142] font-medium">
                Password
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="focus:ring-2 focus:ring-[#1A5FD7]"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
                <InputGroupAddon>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4 text-[#BFC0C0]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#BFC0C0]" />
                    )}
                  </button>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-[#2D3142]">
                  Remember me
                </Label>
              </div>

              <Button variant="link" className="text-[#1A5FD7] p-0" type="button">
                Forgot password?
              </Button>
            </div>

            <Button
              className="w-full bg-[#1A5FD7] hover:bg-[#174bb0] text-white font-medium py-3 rounded-lg transition"
              onClick={handleEmailLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : `Log in as ${role === 'employee' ? 'Employee' : 'Manager'}`}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#E6E8EC] text-[#2D3142] hover:bg-[#F6F8FC]"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="w-4 h-4" />
              Continue with Google
            </Button>

            <div className="text-center text-sm text-[#BFC0C0]">
              Don&apos;t have an account?
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full border-[#1A5FD7] text-[#1A5FD7] hover:bg-[#EEF4FF]"
            >
              <Link to="/create-account">Create Account</Link>
            </Button>
          </FieldGroup>

          <div className="text-center text-xs text-[#BFC0C0]">
            Copyright 2026 Company Leave Management
          </div>
        </Card>
      </section>
    </main>
  )
}
