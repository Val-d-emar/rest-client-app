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

### Настройка Firebase

1. Создание проекта

- [ ] Войдите/зарегистрируйтесь на Firebase.
- [ ] Создайте проект - нажмите "Add project".
- [ ] Введите название проекта, например, rest-client-app.
- [ ] На следующем шаге можно отключить всякие Google предложения, ускорит создание.
- [ ] Примите условия и дождитесь, пока проект будет создан.

2. Включение провайдера Email/Password

- [ ] В меню слева выберите "Authentication" (в разделе "Build").
- [ ] Нажмите кнопку "Get started".
- [ ] На вкладке "Sign-in method" выберите из списка провайдеров "Email/Password".
- [ ] Включите первый переключатель "Email/Password". Вход по ссылке без пароля не нужен.
- [ ] Нажмите "Save".

3. Получение ключей для веб-приложения

- [ ] Вернитесь на главную страницу своего проекта в Firebase (кликнув на его название).
- [ ] Нажмите на иконку "Project Settings" (шестеренка) в левом верхнем меню.
- [ ] Во вкладке "General" пролистайте вниз до секции "Your apps".
- [ ] Нажмите на иконку веб-приложения </>.
- [ ] Придумайте "App nickname" (псевдоним), например, rest-client-web.
- [ ] Нажмите "Register app".
- [ ] Вы увидите объект `firebaseConfig`.
- [ ] Скопируйте в локальной папке проекта файл `.env.example` в `.env.local`
- [ ] Скопируйте ключи из объекта firebaseConfig в `.env.local `в соответствующие переменные окружения `NEXT_PUBLIC_FIREBASE_*`

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
