import './App.css';
import Header from './Header';
import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Post from './Post';
import { Routes, Route } from "react-router-dom";
import { UserContextProvider } from './UserContext';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import NewsPage from './pages/NewsPage';
import ProductPage from './pages/ProductPage';
import { toast, ToastContainer } from 'react-toastify';

//import { UserContextProvider } from './UserContext';

function App() {

  return (
    <>
      <UserContextProvider>
        <ToastContainer></ToastContainer>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<IndexPage />} />
            <Route path={'/login'} element={<LoginPage />} />
            <Route path={'/register'} element={<RegisterPage />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/products" element={<ProductPage />} />

          </Route>
        </Routes>
      </UserContextProvider>

    </>

  )
}

export default App
