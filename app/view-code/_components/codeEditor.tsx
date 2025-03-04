import React from 'react'
import { Sandpack, SandpackCodeEditor, SandpackConsole, SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";
import { amethyst } from "@codesandbox/sandpack-themes";
import Constants from '@/data/Constants';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';


const codeEditor = ({ generatedCode, codeReady, runagain }: any) => {
  return (
    <div className='p-3' style={{ height: "100vh" }}>

      <div className='flex'>
        {/* <h1 className='text-2xl m-2 w-1/2 text-right'>Code Editor</h1> */}
        <div className='w-full flex justify-end items-center mb-5'>
          <Button className='bg-green-500' disabled={!codeReady} onClick={runagain}><RefreshCcw />Run Again</Button>
        </div>
      </div>

      {codeReady ?
        <Sandpack template='react'
          theme={amethyst}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
            showConsoleButton: true,
            showInlineErrors: true,
            showNavigator: true,
            showLineNumbers: true,
            showTabs: true,
            wrapContent: true,
            autorun: true,
            autoReload: false,
            resizablePanels: true,
            editorHeight: 500
          }}
          customSetup={{
            dependencies: {
              ...Constants.DEPENDANCY
            }
          }}
          files={{
            "/App.js": `${generatedCode}`,
            // active: "/App.js"
          }}
        /> :
        <SandpackProvider
          theme={amethyst}
          template="react"
          files={{
            "/App.js": `${generatedCode}`,
            // active: "/App.js"
          }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
        >
          <SandpackLayout>
            <SandpackCodeEditor showTabs={true} showInlineErrors={true} showRunButton={true} style={{ height: "80vh" }} />
          </SandpackLayout>
        </SandpackProvider>
      }
    </div>
  )
}

export default codeEditor