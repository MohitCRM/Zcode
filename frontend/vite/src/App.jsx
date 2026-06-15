import { Navigate, Route, Routes } from "react-router";
import Problems from "./pages/problemshow/problems";
import Standings from "./pages/standings/standings";
import Solutions from  "./pages/solutions/solutions";
import UserRank from "./pages/userrank/userRank";
import UserProfile from "./pages/userprofile/UserProfile";
import AdminPanel from "./pages/admin/adminpanel";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Announcement from "./pages/announcement/announcement";
import Layout from "./pages/layout";
import {checkauth} from "./slicers/authslice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

export default function App()
{
  const {isauth,loading} = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkauth())
  },[]);

  if(loading)
  {
    return(
      <div className="min-h-screen flex items-center justify-center" >
        <span className="loading loading-spinner loading-lg" ></span>
      </div>
    )
  }
  return (
    <>
      <Routes>
        <Route path ="/login" element ={isauth ? <Navigate to="/" /> : <Login></Login>} ></Route>
        <Route path ="/signup" element ={isauth ? <Navigate to="/" /> : <Signup></Signup>}></Route>

        <Route path="/" element={isauth ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/announcements" />} />
        <Route path="announcements" element={<Announcement />} />

        <Route path="problems" element={<Problems />} />

        <Route path="standings" element={<Standings />} />

        <Route path="solutions" element={<Solutions />} />

        <Route path="userRank" element={<UserRank />} />

        <Route path="/userprofile" element={<UserProfile />} />

        <Route path="admin" element={<AdminPanel />}>

        <Route index element={<AdminDashboardSummary />} />
        <Route path="create-problem" element={<CreateProblem />} />
        <Route path="update-problem/:id" element={<UpdateProblem />} />
        <Route path="delete-problem" element={<DeleteProblem />} />
  
        <Route path="create-announcement" element={<CreateAnnouncement />} />
        <Route path="update-announcement/:id" element={<UpdateAnnouncement />} />
        <Route path="delete-announcement" element={<DeleteAnnouncement />} />
      </Route>

      </Route>

      </Routes>
    </>
  )
}