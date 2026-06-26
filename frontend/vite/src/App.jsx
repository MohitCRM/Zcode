import { Navigate, Route, Routes } from "react-router";
import Problems from "./pages/problemshow/problems";
import Standings from "./pages/standings/standings";
import ThisSeason from "./pages/standings/eachseason";
import Problemidsforsol from "./pages/solutions/problemidsforsol";
import Solution from "./pages/solutions/solution";
import UserRank from "./pages/userrank/userRank";
import UserProfile from "./pages/userprofile/UserProfile";
import AdminPanel from "./pages/admin/adminpanel";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Announcements from "./pages/announcement/announcements";
import ProblemDetail from "./pages/problemdetails/problemdetail"
import Layout from "./pages/layout";
import {checkauth} from "./slicers/authslice";
import { getcurrentseason } from "./slicers/seasonslice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Showallproblems from "./pages/admin/showallproblems";
import Showallseasons from "./pages/admin/showallseasons";
import Showallannouncements from "./pages/admin/showallannouncements";
import CreateAnnouncement from "./pages/admin/CreateAnnouncement";
import CreateProblem from "./pages/admin/CreateProblem";
import CreateSeason from "./pages/admin/CreateSeason";
import UpdateAnnouncement from "./pages/admin/UpdateAnnouncement";
import UpdateProblem from "./pages/admin/UpdateProblem";
import UpdateSeason from "./pages/admin/UpdateSeason";


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
        <Route path="announcements" element={<Announcements />} />

        <Route path="problems" >
          <Route index element={<Problems />} />
          <Route path=":problemId" element={<ProblemDetail />} />
        </Route>

        <Route path="standings">
          <Route index element={<Standings />} />
          <Route path=":sid" element={<ThisSeason />} />
        </Route>

        <Route path="solutions" >
          <Route index element={<Problemidsforsol />} />
          <Route path=":pid" element={<Solution />} />
        </Route>

        <Route path="userRank" element={<UserRank />} />

        <Route path="/userprofile" element={<UserProfile />} />

        <Route path="admin" element={<AdminPanel />}>
          {/* Nested routes will now render inside the AdminPanel's <Outlet /> */}
          <Route path="showallproblems" element={<Showallproblems />} />
          <Route path="showallannouncements" element={<Showallannouncements />} />
          <Route path="showallseasons" element={<Showallseasons />} />
  
          <Route path="create-announcement" element={<CreateAnnouncement />} />
          <Route path="create-problem" element={<CreateProblem />} />
          <Route path="create-season" element={<CreateSeason />} />
  
          <Route path="update-announcement/:aid" element={<UpdateAnnouncement />} />
          <Route path="update-problem/:pid" element={<UpdateProblem />} />
            <Route path="update-season/:sid" element={<UpdateSeason />} />
        </Route>
      </Route>

      </Routes>
    </>
  )
}