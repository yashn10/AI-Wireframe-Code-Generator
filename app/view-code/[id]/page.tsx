"use client"

import axios from 'axios';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import CodeEditor from '../_components/codeEditor';
import SelectionDetail from '../_components/selectionDetail';

const page = () => {

    const { id } = useParams();
    const [generatedCode, setGeneratedCode] = useState<any>(null);
    const [record, setRecord] = useState<string | null>(null);
    const [codeReady, setcodeReady] = useState<boolean>(false);
    const [loading, setloading] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            getCodeData();
        }
    }, [id])


    // Utility to remove markdown code fences from generated code
    const cleanGeneratedCode = (code: string) => {
        let cleaned = code.trim();
        // Remove an opening code fence, e.g., ```javascript or ```
        cleaned = cleaned.replace(/^```(javascript)?\s*\n?/, "");
        // Remove a closing code fence if present
        cleaned = cleaned.replace(/\n?```$/, "");
        return cleaned;
    };


    const getCodeData = async () => {
        try {
            const response = await axios.get(`/api/wireframeCode?uid=${id}`);
            // console.log(response.data);

            setRecord(response.data[0]);
            if (response?.data?.[0]?.code === null) {
                generateCode(response.data[0]);
            } else {
                setGeneratedCode(response.data[0].code.response);
                setcodeReady(true);
            }

        } catch (error) {
            console.log("error", error);
        }
    }


    const generateCode = async (data: any) => {
        try {
            setloading(true);
            // Use a default prompt if none is provided
            const promptToUse = data?.prompt;
            console.log("Calling /api/ai-code with data:", { ...data, prompt: promptToUse });

            const response = await fetch("/api/ai-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: data?.model,
                    prompt: promptToUse,
                    imageUrl: data?.imageURL,
                }),
            });

            // console.log("Received response from /api/ai-code:", response);

            if (!response.ok) {
                console.error("API error:", response.statusText);
                setloading(false);
                return;
            }

            if (!response.body) {
                console.error("No response body available for streaming.");
                setloading(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let accumulatedCode = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunk = decoder.decode(value, { stream: !done });
                    // console.log("Received raw chunk:", chunk);

                    // Split the chunk by newlines to process each SSE event
                    const lines = chunk.split("\n");
                    lines.forEach((line) => {
                        line = line.trim();
                        // Look for lines starting with "data:"
                        if (line.startsWith("data:")) {
                            // Remove the "data:" prefix and trim
                            const jsonStr = line.slice("data:".length).trim();
                            // Sometimes an SSE stream can include a [DONE] message
                            if (jsonStr === "[DONE]") {
                                // console.log("Stream ended with [DONE]");
                                return;
                            }
                            try {
                                const parsed = JSON.parse(jsonStr);
                                // Extract the content from the parsed JSON
                                const content = parsed?.choices?.[0]?.delta?.content;
                                if (content) {
                                    accumulatedCode += content;
                                    setGeneratedCode(accumulatedCode);
                                }
                            } catch (error) {
                                console.error("Error parsing SSE JSON:", error);
                                setloading(false);
                            }
                        }
                    });
                }
            }

            // console.log("Streaming complete. Full generated code:", accumulatedCode);
            const finalCode = cleanGeneratedCode(accumulatedCode);
            setGeneratedCode(finalCode);
            setcodeReady(true);
            setloading(false);
        } catch (error) {
            console.error("Error in generateCode:", error);
            setloading(false);
        }
    };


    useEffect(() => {
        if (generatedCode !== '' && id && codeReady ) {
            saveCode();
        }
    }, [generatedCode && id && codeReady])



    const saveCode = async () => {
        const result = await axios.put('/api/wireframeCode', { uid: id, code: { response: generatedCode } });

        console.log(result);
    }


    return (

        <div className='p-5'>
            <div className='w-full flex flex-row'>
                <div className='w-1/5 p-3'>
                    {/* <h1>Generated Data</h1> */}
                    <SelectionDetail record={record} />
                </div>

                <div className='w-4/5 p-3 relative'>
                    {(!generatedCode && loading) ? (
                        <div className="relative flex items-center justify-center h-full">
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gray-900 opacity-60 rounded-lg"></div>
                            {/* Spinner and message */}
                            <div className="z-10 flex flex-col items-center">
                                <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                <span className="mt-2 text-white text-lg">Analyzing Image...</span>
                            </div>
                        </div>
                    ) : (
                        <CodeEditor generatedCode={generatedCode} codeReady={codeReady} runagain={getCodeData} />
                    )}
                </div>
            </div>
        </div>
    )

}

export default page