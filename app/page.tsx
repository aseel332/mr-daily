"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter, redirect } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Button } from "@/components/ui/button";
export default function Home() {

  const [isCreated , setIsCreated] = useState(false);

  const [loading, startTransition] = useTransition();

  const {user, isSignedIn} = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
  if (isSignedIn && user) {
    console.log(user.id)
    if(loading || !isCreated){
      startTransition( async () => {
        const response = await fetch('http://localhost:3000/api/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getToken()}`,
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            fullName: user.fullName || '',
          }),
        });
        console.log('Sync user response:', response);
          if(response.ok){{
          setIsCreated(true);
        }
      }
      }); 
    }
    }
  }, [isSignedIn, user]);

  if(isSignedIn){
    // Navigate to /home page using next navigation or any other method
    // For example, using Next.js useRouter:
    redirect('/home');

  
      return (
        <>
        <button onClick={async () => {
          // begin call 
          const response = await fetch('http://localhost:3000/api/vapi/call', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getToken()}`,
            },
            body: JSON.stringify({
              clerkId: user.id,
              phoneNumber: '+5302207724',
              name: user.fullName // Replace with the desired phone number
            }),
          });
          const data = await response.json();
          console.log('Call response:', data);  
        }}>Call</button>
        </>
      );
    
  }
  return (
      <>
      <header className="bg-[#000000]  flex justify-between items-center p-4 gap-4 h-16">
            <span className="font-bold text-lg">Alfred</span>
            <div className='flex items-center gap-4'>
            <SignedOut>
              <SignInButton>
                <Button className='bg-black' >Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button className='bg-black ' >Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            </div>
          </header>
      <main className="">
        <div className="flex flex-col items-center justify-center min-h-[100px] md:min-h-[200px] p-4">
          <h1 className="text-4xl font-bold  mb-2">Introducing Alfred!!</h1>
          <p className="text-lg mb-4">Your personal AI agent for everything</p>

        </div>
      </main>
      </>
  );
}
