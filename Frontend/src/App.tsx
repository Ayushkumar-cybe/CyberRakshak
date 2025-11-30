import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex justify-center items-center space-x-4">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo w-24 h-24" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react w-24 h-24" alt="React logo" />
        </a>
      </div>
      <h1 className="text-3xl font-bold text-center">Vite + React</h1>
      <div className="card bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <button onClick={() => setCount((count) => count + 1)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          count is {count}
        </button>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Edit <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs text-center mt-4 text-gray-600 dark:text-gray-400">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
