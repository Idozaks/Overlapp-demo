
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { DemoProvider } from './hooks/use-demo'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
