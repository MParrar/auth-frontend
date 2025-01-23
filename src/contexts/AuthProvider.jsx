import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useNotification } from "./NotificationProvider";

const AuthContext = createContext();

export const AuthProvider = ({ children, initialUser = {} }) => {
  const [user, setUser] = useState(initialUser);
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const showNotification = useNotification();

  const getUserProfile = () => {
    setIsLoading(true);
      axios.defaults.headers["Authorization"] = `Bearer ${token}`;
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/users/profile`)
        .then((res) => {
          if(res.data.status === "success"){
            setUser(res.data.user);
          }
        })
        .catch((err) => {
            showNotification("error", err.response.data.message);
            logout();
        })
        .finally(() => setIsLoading(false));
  }
  useEffect(() => {
    if (token) {
      getUserProfile()
    }
  }, [token]);

  const updateUserContext = (id, updatedData) => {
    if (user?.id === id) {
      setUser((prevUser) => ({
        ...prevUser,
        ...updatedData,
      }));
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (user?.role === "admin") {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/admin/list`)
        .then((res) => setUsers(res.data))
        .catch((err) => console.log(err));
    }
    setIsLoading(false);
  }, [user]);

  const login = (userToken) => {
    setIsLoading(true);
    localStorage.setItem("token", userToken);
    setToken(userToken);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setUsers([]);
    navigate("/login");
  };

  const updateUser = (id, updatedData) => {
    setIsLoading(true);
    axios.defaults.headers["Authorization"] = `Bearer ${localStorage.getItem(
      "token"
    )}`;
    axios
      .put(`${import.meta.env.VITE_BASE_URL}/users/${id}`, updatedData)
      .then((res) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id ? { ...user, ...updatedData } : user
          )
        );
        showNotification("success", "User Updated Successfully");
        updateUserContext(id, updatedData);
      })
      .catch((err) =>
        showNotification("error", err.response.data.message)
      )
      .finally(() => setIsLoading(false));
  };

  const createUser = (newUser) => {
    axios
      .post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser)
      .then((res) => {
        setUsers([...users, res.user]);
        showNotification("success", "User Created Successfully");
        updateUserContext(id, updatedData);
      })
      .catch((err) => showNotification("error", "An error occurred. Please try again later"));
  };

  const changePassword = (id, password) => {
    setIsLoading(true);
    axios.defaults.headers["Authorization"] = `Bearer ${localStorage.getItem(
      "token"
    )}`;
    axios
      .put(
        `${import.meta.env.VITE_BASE_URL}/users/change-password/${id}`,
        password
      )
      .then((res) => {
        if (res.data.status === "success"){
          showNotification(
            "success",
            res.data.message
          );
        }
      })
      .catch((err) =>
        showNotification("error", 'An error occurred. Please try again later')
      )
      .finally(() => setIsLoading(false))
  };

  const removeUser = (id) => {
    axios.defaults.headers["Authorization"] = `Bearer ${localStorage.getItem(
      "token"
    )}`;
    axios
      .delete(`${import.meta.env.VITE_BASE_URL}/users/${id}`)
      .then(() => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        showNotification("success", "User has been successfully removed");
      })
      .catch((err) =>
        showNotification("error", 'An error occurred. Please try again later')
      );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        removeUser,
        changePassword,
        createUser,
        getUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
