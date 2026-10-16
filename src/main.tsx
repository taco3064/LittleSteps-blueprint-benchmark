import React from 'react'
import ReactDOM from 'react-dom/client'
import App from "./app/App"
import './index.css'
// Initialize Firebase Analytics
import "~app/platform/services/firebase"
import { redirectLegacyHash } from "~app/portal/services/navigate"

// 必須在 App 讀 location.pathname 之前跑，否則舊的 #/ 連結會先渲染成首頁
// 再跳走，使用者會看到一次閃爍。
redirectLegacyHash()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
