# 🚀 GitHub Basic Commands Guide 
## 📌 What is Git & GitHub?
- **Git** → Version control system (tracks changes in code)
- **GitHub** → Online platform to store and share code

---

## ⚙️ Initial Setup (One Time Only)

### Set your identity
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```
👉 Used to identify who made the changes

---

## 📥 Clone a Repository

```bash
git clone <repo-link>
```
👉 Downloads project from GitHub to your system

Example:
```bash
git clone https://github.com/user/project.git
```

---

## 📂 Navigate into Project Folder

```bash
cd project-name
```
👉 Move inside the project directory

---

## 🔍 Check Status

```bash
git status
```
👉 Shows:
- Modified files
- New files
- Files ready to commit

---

## ➕ Add Changes

```bash
git add .
```
👉 Adds all changes to staging area

OR specific file:
```bash
git add filename
```

---

## 💾 Commit Changes

```bash
git commit -m "your message"
```
👉 Saves snapshot of changes  
👉 Message should describe what you did

Example:
```bash
git commit -m "Added login feature"
```

---

## 🚀 Push Changes to GitHub

```bash
git push origin main
```
👉 Uploads your changes to GitHub

---

## 🌿 Check Branch

```bash
git branch
```
👉 Shows current branch

---

## 🔄 Pull Latest Changes

```bash
git pull origin main
```
👉 Gets latest updates from GitHub

---

## ⚠️ First Time Push (If error comes)

```bash
git push --set-upstream origin main
```
👉 Links your branch with GitHub

---

## 🧠 Basic Workflow (Remember This)

```bash
git status
git add .
git commit -m "message"
git push origin main
```

---

## ❗ Common Errors

### 1. Git not recognized
👉 Git not added to PATH

### 2. Author identity unknown
👉 Run:
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### 3. Authentication issue
👉 Login in browser or use GitHub token

---

## 🎯 Summary

- `clone` → download project  
- `add` → prepare changes  
- `commit` → save changes  
- `push` → upload to GitHub  
- `pull` → get latest updates  

---

## 💡 Pro Tip
Always run:
```bash
git status
```
before doing anything → avoids confusion

---

🔥 You're now ready to use Git like a pro!
