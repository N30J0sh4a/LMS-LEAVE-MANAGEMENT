import { useEffect, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Eye, EyeOff, Mail, User } from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'

import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../components/ui/input-group'
import { Field, FieldGroup, FieldLabel } from '../components/ui/field'
import { Checkbox } from '../components/ui/checkbox'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

import { auth } from '../lib/firebase'
import { registerUserProfile, type UserRole } from '../lib/auth-api'
import { saveUserProfile } from '../lib/session'

export const Route = createFileRoute('/create-account')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('employee')
  const [agreed, setAgreed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.title = 'Create an account'
  }, [])

  const handleRegister = async () => {
    setErrorMessage('')

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please complete all required fields.')
      return
    }

    if (!agreed) {
      setErrorMessage('You must agree to the account policy and usage guidelines.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    try {
      setIsLoading(true)
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()
      const userProfile = await registerUserProfile(idToken, { fullName, role })
      saveUserProfile(userProfile)
      await navigate({ to: userProfile.role === 'employee' ? '/employee' : '/manager' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create account.'
      setErrorMessage(message)
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
            Create your enterprise account
          </h1>

          <p className="text-[#BFC0C0] text-lg max-w-md leading-relaxed">
            Join the leave management workspace with secure access, structured roles,
            and enterprise-ready controls for modern HR teams.
          </p>

          <div className="mt-10 text-sm text-[#BFC0C0]">
            Secure onboarding - Corporate standards - Trusted platform
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12 relative">
        <div className="absolute top-8 md:hidden">
          <img src="./logo-32x32.png" alt="logo" className="w-12 rounded-lg mx-auto" />
        </div>

        <Card className="w-full max-w-md p-8 md:p-10 rounded-2xl shadow-2xl border border-[#E6E8EC] bg-white">
          <Button
            asChild
            variant="ghost"
            className="mb-3 w-fit px-2 text-[#1A5FD7] hover:bg-[#EEF4FF]"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </Button>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-semibold text-[#2D3142]">Create account</h2>
            <p className="text-sm text-[#BFC0C0] mt-2">
              Set up your corporate access credentials
            </p>
          </div>

          <FieldGroup className="space-y-5">
            <Field orientation="vertical">
              <FieldLabel className="text-[#2D3142] font-medium">Full name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  placeholder="Juan Dela Cruz"
                  className="focus:ring-2 focus:ring-[#1A5FD7]"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <User className="w-4 h-4 text-[#BFC0C0]" />
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field orientation="vertical">
              <FieldLabel className="text-[#2D3142] font-medium">Company email</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type="email"
                  placeholder="you@company.com"
                  className="focus:ring-2 focus:ring-[#1A5FD7]"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <Mail className="w-4 h-4 text-[#BFC0C0]" />
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field orientation="vertical">
              <FieldLabel className="text-[#2D3142] font-medium">Position</FieldLabel>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="vertical">
              <FieldLabel className="text-[#2D3142] font-medium">Create password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="focus:ring-2 focus:ring-[#1A5FD7]"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
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

            <Field orientation="vertical">
              <FieldLabel className="text-[#2D3142] font-medium">Confirm password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Retype your password"
                  className="focus:ring-2 focus:ring-[#1A5FD7]"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <Eye className="w-4 h-4 text-[#BFC0C0]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#BFC0C0]" />
                    )}
                  </button>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <div className="flex items-start gap-2 text-sm">
              <Checkbox id="terms" className="mt-0.5" checked={agreed} onCheckedChange={(value) => setAgreed(Boolean(value))} />
              <Label htmlFor="terms" className="text-[#2D3142] leading-5">
                I agree to the account policy and secure usage guidelines.
              </Label>
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}

            <Button
              className="w-full bg-[#1A5FD7] hover:bg-[#174bb0] text-white font-medium py-3 rounded-lg transition"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create your account'}
            </Button>

            <div className="text-center text-sm text-[#BFC0C0]">
              Already have an account?
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full border-[#1A5FD7] text-[#1A5FD7] hover:bg-[#EEF4FF]"
            >
              <Link to="/">Return to Sign in</Link>
            </Button>
          </FieldGroup>

          <div className="text-center text-xs text-[#BFC0C0] mt-6">
            Copyright 2026 Company Leave Management
          </div>
        </Card>
      </section>
    </main>
  )
}
