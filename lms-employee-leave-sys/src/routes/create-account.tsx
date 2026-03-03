import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card } from '../components/ui/card'
import { 
  InputGroup, 
  InputGroupAddon, 
  InputGroupInput,
   } from '../components/ui/input-group';
import { Eye, Mail } from 'lucide-react';
import { Field, FieldGroup, FieldLabel } from "../components/ui/field"
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"

export const Route = createFileRoute('/create-account')({
  component: RouteComponent,
})

function RouteComponent() {

    useEffect(() => {
        document.title="Create an account"
    });


  return <main className='flex flex-col flex-1 w-screen h-screen bg-linear-90 from-blue-400 to-blue-800'>
    <section className='flex flex-1 w-full h-full px-[30dvw] py-[20dvh] justify-center align-center'>
      <Card
        className='flex flex-1 flex-col w-fit h-fit gap-5 px-[5dvw] py-[10dvh] justify-center content-center'
      >

        {/**Texts */}
        <div className='flex flex-0 w-full h-auto gap-5'>
            <ArrowBackIosIcon className="self-center"/>
            <p className='text-3xl font-normal'>Create an account</p>
        </div>

        <FieldGroup>
            <Field orientation={"horizontal"}>
                
            </Field>
        </FieldGroup>

        {/**Button Group */}
        <div className='flex flex-1 flex-col w-full h-full'>
            <FieldGroup>
                <Field
                    orientation={"vertical"}
                >
                    <FieldLabel id='inline-end-input' className='font-regular'>Email<span className="text-red-600">*</span></FieldLabel>
                    <InputGroup>
                        <InputGroupInput placeholder="Enter your email address...">
                        </InputGroupInput>
                        <InputGroupAddon align="inline-end">
                            <Mail/>
                        </InputGroupAddon>
                    </InputGroup>

                    <FieldLabel htmlFor='inline-end-input' className='font-regular'>Create a new password</FieldLabel>
                    <InputGroup>
                        <InputGroupInput placeholder="Enter your password here..." type='password' id="inline-end-input"/>
                        <InputGroupAddon align="inline-end">
                            <Eye/>
                        </InputGroupAddon>
                    </InputGroup>

                    <FieldLabel htmlFor='inline-end-input' className='font-regular'>Retype your password</FieldLabel>
                    <InputGroup>
                        <InputGroupInput placeholder="Retype your password here..." type='password' id="inline-end-input"/>
                        <InputGroupAddon align="inline-end">
                            <Eye/>
                        </InputGroupAddon>
                    </InputGroup>
                </Field>

                <Button
                    asChild
                >
                    <Link to="/create-account">Create your account</Link>
                </Button>
            </FieldGroup>
        </div>

        {/**For checkboxes */}
      </Card>
    </section>
  </main>
}
