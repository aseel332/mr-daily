"use client"
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import React from 'react'
import { useUser, useAuth } from "@clerk/nextjs";


const Home = () => {
  const {user, isSignedIn} = useUser();
  const { getToken } = useAuth();
  if(!user) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className=' w-full flex justify-between px-2'>
        <span className='text-2xl'>Hey Aseel, tell me what's on your mind today?</span>
        <Button onClick={async () => {
          // begin call 
          const response = await fetch('http://localhost:3000/api/vapi/call', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getToken()}`,
            },
            body: JSON.stringify({
              clerkId: user.id,
              phoneNumber: '+15302207724',
              name: user.fullName // Replace with the desired phone number
            }),
          });
          const data = await response.json();
          console.log('Call response:', data);  
        }} className='bg-black' variant={"default"}><Phone /> Call</Button>
      </div>
      <div>
        {/* creating different boxes for calendars, to-dos, and thoughts */}
        <div className='grid grid-cols-3 gap-4 p-4'>
          <div className='bg-gray-800 p-4 rounded-lg'>
            <h2 className='text-xl mb-2'>Calendar</h2>
            {/* Calendar content goes here */}
          </div>
          <div className='bg-gray-800 p-4 rounded-lg'>
            <h2 className='text-xl mb-2'>To-dos</h2>
            {/* To-dos content goes here */}
          </div>
          <div className='bg-gray-800 p-4 rounded-lg'>
            <h2 className='text-xl mb-2'>Thoughts</h2>
            {/* Thoughts content goes here */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home