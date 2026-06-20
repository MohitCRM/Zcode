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
import ProblemDetail from "./pages/problemdetails/problemdetail"
import Layout from "./pages/layout";
import {checkauth} from "./slicers/authslice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import CreateAnnouncement from "./pages/admin/CreateAnnouncement";
import CreateProblem from "./pages/admin/CreateProblem";
import CreateSeason from "./pages/admin/CreateSeason";
import UpdateAnnouncement from "./pages/admin/UpdateAnnouncement";
import UpdateProblem from "./pages/admin/UpdateProblem";
import UpdateSeason from "./pages/admin/UpdateSeason";
import DeleteAnnouncement from "./pages/admin/DeleteAnnouncement";
import DeleteProblem from "./pages/admin/DeleteProblem";
import DeleteSeason from "./pages/admin/DeleteSeason";

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

        <Route path="problems" >
          <Route index element={<Problems />} />
          <Route path=":problemId" element={<ProblemDetail />} />
        </Route>

        <Route path="standings" element={<Standings />} />

        <Route path="solutions" element={<Solutions />} />

        <Route path="userRank" element={<UserRank />} />

        <Route path="/userprofile" element={<UserProfile />} />

        <Route path="admin" element={<AdminPanel />}>
        
        <Route path="create-problem" element={<CreateProblem />} />
        <Route path="update-problem/:id" element={<UpdateProblem />} />
        <Route path="delete-problem/:id" element={<DeleteProblem />} />
  
        <Route path="create-announcement" element={<CreateAnnouncement />} />
        <Route path="update-announcement/:id" element={<UpdateAnnouncement />} />
        <Route path="delete-announcement/:id" element={<DeleteAnnouncement />} />
        
        <Route path="create-season" element={<CreateSeason/>} />
        <Route path="update-season/:id" element={<UpdateSeason/>} />
        <Route path="delete-season/:id" element={<DeleteSeason/>} /> 
      </Route>

      </Route>

      </Routes>
    </>
  )
}