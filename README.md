# for students' MIRACLE-MORNING
<div><img src="https://wakapi.hegelty.me/api/badge/hegelty/interval:any/project:miracle-morning"/></div>

---
## Kill Port (in Window)
```bash
   netstat -a -o
   taskkill /f /pid [PID]
```

---

## File Setting (editting...)

```bash
📦src
 ┣ 📂app
 ┃ ┣ 📂(main)
 ┃ ┃ ┣ 📂(links)
 ┃ ┃ ┃ ┣ 📂classroom
 ┃ ┃ ┃ ┃ ┣ 📂(pages)
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┃ ┗ 📂[id]
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂home
 ┃ ┃ ┃ ┃ ┣ 📂(pages)
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┃ ┗ 📂new
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂homeworks
 ┃ ┃ ┃ ┃ ┣ 📂(pages)
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┃ ┗ 📂[id]
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📂mypage
 ┃ ┃ ┃ ┃ ┗ 📂(pages)
 ┃ ┃ ┃ ┃ ┃ ┣ 📜common.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜page.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜_page.tsx
 ┃ ┃ ┃ ┣ 📂notifications
 ┃ ┃ ┃ ┃ ┣ 📂(pages)
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┃ ┗ 📂[id]
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┗ 📂timeTable
 ┃ ┃ ┃ ┃ ┗ 📂(pages)
 ┃ ┃ ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂(loginPage)
 ┃ ┃ ┃ ┣ 📂new
 ┃ ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┣ 📜mobile.tsx
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📜common.tsx
 ┃ ┃ ┃ ┣ 📜desktop.tsx
 ┃ ┃ ┃ ┣ 📜functions.ts
 ┃ ┃ ┃ ┗ 📜mobile.tsx
 ┃ ┃ ┣ 📜globals.css
 ┃ ┃ ┗ 📜layout.tsx
 ┃ ┗ 📂(others)
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┃ ┣ 📂(tools)
 ┃ ┃ ┃ ┃ ┣ 📜auth.ts
 ┃ ┃ ┃ ┃ ┗ 📜tools.ts
 ┃ ┃ ┃ ┣ 📂admin
 ┃ ┃ ┃ ┃ ┣ 📂class
 ┃ ┃ ┃ ┃ ┃ ┣ 📂join
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂student
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┣ 📂quit
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂student
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┣ 📂log
 ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┣ 📂today
 ┃ ┃ ┃ ┃ ┃ ┣ 📂question
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┗ 📂user
 ┃ ┃ ┃ ┃ ┃ ┣ 📂accept
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┣ 📂list
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┣ 📂reject
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┣ 📂reset_password
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂class
 ┃ ┃ ┃ ┃ ┗ 📂[class_id]
 ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┣ 📂docs
 ┃ ┃ ┃ ┃ ┣ 📜page.tsx
 ┃ ┃ ┃ ┃ ┗ 📜react-swagger.tsx
 ┃ ┃ ┃ ┗ 📂user
 ┃ ┃ ┃ ┃ ┣ 📂info
 ┃ ┃ ┃ ┃ ┃ ┣ 📂[user_id]
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┣ 📂login
 ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┣ 📂logout
 ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┣ 📂register
 ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┗ 📂today
 ┃ ┃ ┃ ┃ ┃ ┣ 📂question
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┃ ┃ ┃ ┗ 📂sleep
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜route.ts
 ┃ ┃ ┗ 📜layout.tsx
 ┣ 📂database
 ┃ ┣ 📜index.tsx
 ┃ ┗ 📜schema.ts
 ┣ 📂lib
 ┃ ┗ 📜swagger.ts
 ┗ 📜middleware.tsx
 ```
