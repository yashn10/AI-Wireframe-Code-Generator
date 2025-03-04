"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Textarea } from '@/components/ui/textarea'
import { CloudUpload, Loader2, Sparkles, X, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import React, { ChangeEvent, useState } from 'react'
import axios from 'axios'
import uuid4 from 'uuid4';
import { useAuthContext } from '@/app/provider'
import { useRouter } from 'next/navigation'
import Constants from '@/data/Constants'

const ImageUpload = () => {

    const router = useRouter();
    const [imagePreview, setimagePreview] = useState<string | null>();
    const [image, setImage] = useState<any>();
    const [selectedAIModel, setSelectedAIModel] = useState<string | undefined>();
    const [description, setDescription] = useState<string>("");
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [loading, setloading] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const user = useAuthContext();


    const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const image = e.target.files;

        if (image) {
            const url = URL.createObjectURL(image[0]);
            setimagePreview(url);
            setImage(image[0]);
        }
    }

    const generateCode = async () => {
        if (!image) {
            alert("Please upload an image first.");
            return;
        }

        if (!selectedAIModel) {
            alert("Please select an AI Model.");
            return;
        }

        try {
            // Check user credits
            await axios.get('/api/user', { params: { email: user?.user?.email } });

            // If credits check passes, proceed with generating code
            try {
                setloading(true);
                const cloudinaryUrl = await uploadImageToCloudinary(image);
                if (!cloudinaryUrl) {
                    alert("Failed to upload image to Cloudinary.");
                    setloading(false);
                    return;
                }
                console.log("Cloudinary URL:", cloudinaryUrl);
                await generateCodeFromImage(cloudinaryUrl, selectedAIModel, description);
            } catch (error) {
                console.error("Error uploading image and generating code:", error);
                alert("Failed to upload image and generate code. Please check the console for details.");
                setloading(false);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Instead of alerting the user, open the drawer to show a friendly message.
                console.log("Credits check error:", error.response.data.error);
                setDrawerOpen(true);
            } else {
                alert("An unexpected error occurred");
                console.error("Unexpected error", error);
            }
            return;
        }
    };

    const uploadImageToCloudinary = async (imageFile: File): Promise<string | null> => {
        const formData = new FormData();
        const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const upload_preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        formData.append('file', imageFile);
        if (upload_preset) {
            formData.append('upload_preset', upload_preset); // Replace with your Cloudinary upload preset
        } else {
            throw new Error("Cloudinary cloud name is not defined.");
        }
        if (cloud_name) {
            formData.append('cloud_name', cloud_name); // Replace with your Cloudinary cloud name
        } else {
            throw new Error("Cloudinary cloud name is not defined.");
        }


        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, { // Replace with your Cloudinary cloud name
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                setloading(false);
                throw new Error(`Cloudinary upload failed with status: ${response.status}`);
            }

            const data = await response.json();
            return data.secure_url; // URL of the uploaded image
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            return null;
        }
    };

    const generateCodeFromImage = async (imageUrl: string, aiModel: string, description: string) => {
        try {
            const uid = uuid4();
            const result = await axios.post('/api/wireframeCode', { uid, imageURL: imageUrl, email: user?.user?.email, model: aiModel, prompt: description });

            console.log(result.data);
            router.push(`/view-code/${uid}`);
            setloading(false);
        } catch (error) {
            console.log("error", error);
            setloading(false);
        }
    };


    return (
        <div className='grid grid-cols-2 gap-5'>

            <div className='p-10 border border-gray-300 rounded'>
                {!imagePreview ?
                    <>
                        <CloudUpload className='mx-auto' />
                        <p className='text-center text-gray-500'>Upload your image</p>

                        <Input type='file' id='fileUpload' className='hidden' onChange={onUpload} multiple={false} />

                        <div className='w-1/4 mx-auto mt-5'>
                            <label htmlFor='fileUpload'>
                                <h1 className='bg-primary text-white rounded p-2 text-center cursor-pointer'>Upload</h1>
                            </label>
                        </div>
                    </>
                    :
                    <div>
                        <X className=' top-2 right-2 cursor-pointer' onClick={() => setimagePreview(null)} />
                        <Image src={imagePreview} alt='image' width={500} height={200} />
                    </div>
                }
            </div>

            <div className='p-10 border border-gray-300 rounded'>
                <h1>Select AI Model</h1>
                <Select onValueChange={setSelectedAIModel}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                        {Constants?.AiModelList?.map((model, index) => {
                            return (
                                <SelectItem className='cursor-pointer' key={index} value={model.value}>{model.name}</SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>

                <Textarea
                    rows={8}
                    className='mt-3'
                    placeholder='Add some description about your image to generate more accurate results'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div className='mt-5'>
                    <Button onClick={generateCode} disabled={loading}>{loading ? <Loader2 className='animate-spin' /> : <Sparkles />} Generate Code</Button>
                </div>

                {generatedCode && (
                    <div className='mt-5 p-4 border rounded bg-gray-100'>
                        <pre className='whitespace-pre-wrap'>
                            <code>
                                {generatedCode}
                            </code>
                        </pre>
                    </div>
                )}
            </div>

            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                {/* <DrawerTrigger asChild>
                    <Button variant="outline">Open Drawer</Button>
                </DrawerTrigger> */}
                <DrawerContent className='bg-black'>
                    <div className="mx-auto w-full max-w-sm" style={{ height: "40vh" }}>
                        <DrawerHeader>
                            <DrawerTitle className="flex items-center gap-2 text-white mt-5">
                                <AlertTriangle className="text-red-500" />
                                Insufficient Credits
                            </DrawerTitle>
                            <DrawerDescription>
                                It appears you don't have enough credits to generate code. Please purchase more credits through subscription plans or contact support for assistance.
                            </DrawerDescription>
                        </DrawerHeader>
                        <DrawerFooter>
                            {/* <Button>Submit</Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose> */}
                            <Button onClick={() => setDrawerOpen(false)}>Close</Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

        </div>
    )
}

export default ImageUpload