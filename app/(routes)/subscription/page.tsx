"use client"

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/provider';
import axios from 'axios';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

const page = () => {

    const [credits, setCredits] = useState();
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);


    const getCredits = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/subscription?email=${user?.email}`);
            setCredits(response.data.credits);
            setLoading(false);
        } catch (error) {
            console.log("error fetching credits", error);
            setLoading(false);
        }
    }


    useEffect(() => {
        user && getCredits();
    }, [user])


    return (

        <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Subscription</h1>
                <div className="flex items-center justify-center mb-4 space-x-2">
                    <span className="text-lg text-gray-700">Credits Remaining:</span>
                    {loading ? (
                        <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                    ) : (
                        <span className="text-xl font-semibold text-indigo-600">
                            {credits ?? 0}
                        </span>
                    )}
                </div>
                <p className="text-gray-500 mb-6">
                    Use your credits to generate amazing wireframes. Need more? Upgrade your plan to get extra credits!
                </p>
                <Button variant="outline" className="w-full">
                    Upgrade Plan <Sparkles className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>

    )
}

export default page