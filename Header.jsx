import { useEffect, useState } from "react";
import { useContext } from "react";

import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";
//import { UserContext } from "./UserContext";
export default function Header() {
  //const [username,setUsername]=useState(null);
  const { setUserInfo, userInfo } = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        //setUsername(userInfo.username);
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  //const { username } = userInfo;
  const username = userInfo?.username;
  return (
    <header>
      <Link to="/" className="logo">SmartShop</Link>
      <nav>
        {username && (
          <>

            <Link to="/products">Shop</Link>
            <Link to="/news">News</Link>
            <Link to="/create">Add Review </Link>
            <a onClick={logout}>Logout</a>


          </>
        )}
        {!username && (
          <>


            <Link to="/products">Shop</Link>
            <Link to="/news">News</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>


          </>
        )}

      </nav>

    </header>
  );
}