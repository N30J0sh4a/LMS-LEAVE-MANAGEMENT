import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card } from '../components/ui/card'
import { 
  InputGroup, 
  InputGroupAddon, 
  InputGroupInput,
  InputGroupText,
   } from '../components/ui/input-group';
import { Eye, EyeOffIcon } from 'lucide-react';
import { Field, FieldGroup, FieldLabel } from "../components/ui/field"
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {

  useEffect(() => {
    document.title = "Sign in"
  }, []);
  return <main className='flex flex-col flex-1 w-screen h-screen bg-linear-90 from-blue-400 to-blue-800'>
    <section className='flex flex-1 w-full h-full px-[30dvw] py-[10dvh] justify-center align-center'>
      <Card
        className='flex flex-1 flex-col w-fit h-fit gap-5 px-[5dvw] py-[10dvh] justify-center content-center'
      >
        <img src='./logo-32x32.png' alt='logo' className='w-20 h-auto rounded-xl self-center'/>

        {/**Texts */}
        <div className='flex flex-0 flex-col w-full text-center'>
          <p className='text-3xl font-normal'>Sign in</p>
          <p className='text-xl text-stone-500 font-normal'>Sign in using your credentials</p>
        </div>

        {/**Button Group */}
        <div className='flex flex-1 flex-col w-full h-full'>
        <FieldGroup>
          <Field
              orientation={"vertical"}
            >
              <FieldLabel htmlFor="inline-end-input" className='font-regular'>Email</FieldLabel>
              <InputGroup>
                <InputGroupInput placeholder="example.com" className='pl-0.5!'/>
                <InputGroupAddon align='inline-end'>
                  <InputGroupText>.com</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor='inline-end-input' className='font-regular'>Password</FieldLabel>
              <InputGroup>
                <InputGroupInput placeholder="Enter your password here..." type='password' id="inline-end-input"/>
                  <InputGroupAddon>
                    <EyeOffIcon/>
                  </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field orientation="horizontal">
              <Checkbox id='remember-password' name='remember-password'/>
              <Label htmlFor="remember-checkbox" className="font-normal">Remember password</Label>

              <div className='flex flex-1 w-auto h-fit'/>

              <Button
                variant={"link"}
              >Forgot password?</Button>
            </Field>

            <Field orientation="vertical">
              <FieldGroup>
                <Button asChild
                  variant={"default"}
                  
                >
                  <Link to="/create-account">Create an account</Link>
                </Button>
              </FieldGroup>

              <FieldGroup>
                <Button
                  asChild
                  variant={"outline"}
                >
                  <Link to="/">Log in as an Employee</Link>
                </Button>
              </FieldGroup>

              <FieldGroup>
                <Button
                  variant={"outline"}
                >
                  <Link to="/">Log in as a Manager</Link>
                </Button>
              </FieldGroup>
            </Field>
        </FieldGroup>
        </div>

        {/**For checkboxes */}
      </Card>
    </section>
  </main>
}
