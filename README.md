# 🚀 RESTronauts — REST Client App

Welcome to our lightweight version of Postman for building and using APIs!
This project is the [final assignment](https://github.com/rolling-scopes-school/tasks/blob/master/react/modules/tasks/final.md) of the [RS School React Course](https://rs.school/courses/reactjs).

---

## 🛠️ Tech Stack

- ⏩ **Next.js (App Router)**
- 📝 **TypeScript**
- 🔥 **Firebase**
- 🔍 **ESLint**
- ✨ **Prettier**
- 🐶 **Husky**
- 🚀 **Vitest**
- 🎨 **CSS**

---

## 🚀 Getting Started

```bash
git clone https://github.com/Val-d-emar/rest-client-app.git
cd rest-client-app
npm ci
```

### Firebase Setup

#### 1. Creating a project

- [ ] Sign in/register on Firebase.
- [ ] Create a project - click "Add project".
- [ ] Enter the project name, for example, rest-client-app.
- [ ] On the next step, you can disable all Google suggestions, this will speed up the creation.
- [ ] Accept the terms and wait for the project to be created.

#### 2. Enabling the Email/Password provider

- [ ] In the menu on the left, select "Authentication" (in the "Build" section).
- [ ] Click the "Get started" button.
- [ ] In the "Sign-in method" tab, select "Email/Password" from the list of providers.
- [ ] Enable the first "Email/Password" toggle. Passwordless sign-in is not needed.
- [ ] Click "Save".

#### 3. Configuring Firestore (for `history` storage)

- [ ] In the menu on the left, select **Build → Firestore Database**.
- [ ] Click **"Create database"**.
- [ ] **Select edition** - Choose **"Start in test mode"**.
- [ ] **Database ID & location** - Select a **region** (for example, `eur3 (europe-west)`). Click "Enable".
- [ ] **Configure** - Select "Start in test mode".
- [ ] Click "Create".
- [ ] In the database menu under the "Database" heading, select "Indexes", click "Create index".
- [ ] Enter the information to build the indexes (be careful, case matters): Collection Id: `history`; Field path: `userId` Ascending; Field path: `timestamp` Descending; Query scopes: Collection;
- [ ] Click "Create". Wait until the index status is `enabled`.
- [ ] Run the application, make any request. A collection will be created in the database based on the result of the request.
- [ ] Go to the Firebase console, select "Firestore Database" to view the `history` collection.

#### 4. Getting keys for the web application

- [ ] Return to your project's main page in Firebase (by clicking on its name).
- [ ] Click on the "Project Settings" icon (the gear) in the top-left menu.
- [ ] In the "General" tab, scroll down to the "Your apps" section.
- [ ] Click on the web app icon `</>`.
- [ ] Come up with an "App nickname", for example, `rest-client-web`.
- [ ] Click "Register app".
- [ ] You will see a `firebaseConfig` object.
- [ ] In your local project folder, copy the `.env.example` file to `.env.local`.
- [ ] Copy the keys from the `firebaseConfig` object into `.env.local` into the corresponding environment variables:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
  NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
  NEXT_PUBLIC_FIREBASE_APP_ID="..."
  ```

**_NOTE:_** _If you are the Reviewer and you don't want to create your own database, you can request us ours file .env.local with the db settings for the local checking this project by [RS App](https://app.rs.school/profile?githubId=val-d-emar), [Discord](https://discordapp.com/users/1182354659659227216) or [Telegram](https://t.me/Vladimir_901)_

### To run the app locally:

```bash
npm run dev
```

## 👨‍🚀 Team

- 👨‍💻 [Vladimir](https://github.com/Val-d-emar)
- 👩‍💻 [Olena](https://github.com/olenaweb)
- 👩‍💻 [Anna](https://github.com/binary-apple)

## 📜 License

[MIT](./LICENSE)
