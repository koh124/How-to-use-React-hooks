import React, { createContext } from "react";
import { createRoot } from 'react-dom/client';
import App from "./components/App";

const container = document.getElementById('app');
const root = createRoot(container);

// useContext用
// グローバルで共有したいデータを用意する
const userInfo = {
  name: 'kohei',
  is_auth: true,
  is_admin: true,
}

// contextを作るときは変数名を大文字にするのが一般的
const UserInfoContext = createContext(userInfo);

root.render(
  <UserInfoContext.Provider value={userInfo}>
    <App/>
  </UserInfoContext.Provider>
);

// Contextはコンポーネントという扱いの模様
// 他のコンポーネントでimportできるように、exportしておく必要がある
export default UserInfoContext;
