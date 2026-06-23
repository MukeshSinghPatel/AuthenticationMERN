import { assets } from '@/assets/assets'
import React, { useContext } from 'react'
import { Button } from './ui/button'
import { AppContent } from '@/context/AppContext'

const Header = () => {
  const {userData} = useContext(AppContent);

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
        <img src={assets.header_img} alt='' className='w-36 h-36 rounded-full mb-6' />
        <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey {userData ? userData.name : 'Developer'}  
        <img className='w-g aspect-square' src={assets.hand_wave} /></h1>
        <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to RozgarHub</h2>
        <p className='mb-8 max-w-md'>Your Career Journey Starts Here</p>
        <Button className="cursor-pointer">Get Started</Button>
    </div>
  )
}

export default Header