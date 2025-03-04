import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import React from 'react'

const selectionDetail = ({ record }: any) => {
  return (
    <div className='p-3 bg-gray-100' style={{ height: "90vh" }}>
      <h1 className='text-2xl m-2 text-center'>Code Editor</h1>

      {record &&
        <div>

          <p>
            <Image src={record?.imageURL} alt="Image" width={300} height={100} />
          </p>

          <div className='mt-3'>
            <h2>Model Used:</h2>
            <Input defaultValue={record?.model} className='bg-white text-gray-900' disabled={true} />
          </div>

          <div>
            <h2>Description:</h2>
            <Textarea defaultValue={record?.prompt} className='bg-white text-gray-700' rows={5} disabled={true} />
          </div>

        </div>
      }

    </div>
  )
}

export default selectionDetail