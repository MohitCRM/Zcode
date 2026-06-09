import { Navigate, Route, Routes } from "react-router";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import {checkauth} from "./slicers/authslice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

export default function App()
{
  const {isauth} = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkauth())
  },[]);

  return (
    <>
      <Routes>
        <Route path ="/" element = {isauth ? <Homepage></Homepage> : <Navigate to="/signup" />}></Route>
        <Route path ="/login" element ={isauth ? <Navigate to="/" /> : <Login></Login>} ></Route>
        <Route path ="/signup" element ={isauth ? <Navigate to="/" /> : <Signup></Signup>}></Route>
      </Routes>
    </>
  )
}