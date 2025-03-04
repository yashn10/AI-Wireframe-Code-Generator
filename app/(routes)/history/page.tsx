"use client"

import { useAuthContext } from '@/app/provider';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';


const page = () => {

  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  interface HistoryItem {
    imageURL: string;
    prompt: string;
    model: string;
    uid: string;
  }

  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    user && getHistory();
  }, [user])


  const getHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/wireframeCode?email=${user?.email}`);
      console.log(response.data);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };


  const visitWireframe = (id: string) => {
    router.push(`/view-code/${id}`);
  }


  return (

    <div>
      <h1 className='text-2xl m-2 font-bold text-gray-600'>Your Wireframes History</h1>
      <div className='grid grid-cols-3 gap-4'>
        {loading ? (
          // Display multiple skeleton cards while loading
          <>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-3 m-2">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </>
        ) : (
          // Once loaded, map over the history items
          history.map((item, index) => (
            <div key={index} className='m-2'>
              <Card>
                <CardHeader>
                  <Image
                    className='rounded'
                    src={item.imageURL}
                    alt="Wireframe Image"
                    width={300}
                    height={200}
                  />
                </CardHeader>
                <CardContent>
                  <p className='text-gray-600 text-sm'>
                    {item.prompt ? item.prompt : "No prompt found for this wireframe"}
                  </p>
                </CardContent>
                <CardFooter className='flex justify-between items-center'>
                  <div>
                    <h1 className='font-bold text-gray-600'>Model Used:</h1>
                    <p className='text-pink-600 text-sm ml-1'>{item.model}</p>
                  </div>
                  <div>
                    <Button onClick={() => visitWireframe(item.uid)}>
                      <ImageIcon className='mr-1' /> View Wireframe
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>

  )

}

export default page