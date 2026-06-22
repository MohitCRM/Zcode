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
import { getcurrentseason } from "./slicers/seasonslice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Showallproblems from "./pages/admin/showallproblems";
import Showallseasons from "./pages/admin/showalleasons";
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
  const {isauth,loading:authloading} = useSelector((state) => state.auth);
  const {loading:seasonloading} = useSelector((state)=>state.season);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkauth()).then(()=>{
      dispatch(getcurrentseason());
    })
  },[dispatch]);

  if(authloading || seasonloading)
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

        <Route path="admin" element={<AdminPanel />}></Route>
        
        <Route path="/admin/create-problem" element={<CreateProblem />} />
        <Route path="/admin/showallproblems/:sid" element={<Showallproblems />} />
        <Route path="/admin/update-problem/:id" element={<UpdateProblem />} />
        <Route path="/admin/delete-problem/:id" element={<DeleteProblem />} />
  
        <Route path="/admin/create-announcement" element={<CreateAnnouncement />} />
        <Route path="/admin/update-announcement/:id" element={<UpdateAnnouncement />} />
        <Route path="/admin/delete-announcement/:id" element={<DeleteAnnouncement />} />
        
        <Route path="/admin/create-season" element={<CreateSeason/>} />
        <Route path="/admin/showallseasons" element={<Showallseasons/>} />
        <Route path="/admin/update-season/:id" element={<UpdateSeason/>} />
        <Route path="/admin/delete-season/:id" element={<DeleteSeason/>} /> 
      

      </Route>

      </Routes>
    </>
  )
}