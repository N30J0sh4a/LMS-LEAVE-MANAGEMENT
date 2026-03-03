import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import "@fontsource/inter/index.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
