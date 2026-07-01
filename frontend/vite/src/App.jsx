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
import ProblemDetail from "./pages/problemdetails/problemdetail";
import Landingpage from "./pages/landingpage/landingpage";
import Layout from "./pages/layout";
import AdminRoute from "./adminroute";
import { checkauth } from "./slicers/authslice";
import { getcurrentseason } from "./slicers/seasonslice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import SetTime from "./pages/admin/time";
import Showallproblems from "./pages/admin/showallproblems";
import Showallseasons from "./pages/admin/showallseasons";
import Showallannouncements from "./pages/admin/showallannouncements";
import CreateAnnouncement from "./pages/admin/CreateAnnouncement";
import CreateProblem from "./pages/admin/CreateProblem";
import CreateSeason from "./pages/admin/CreateSeason";
import UpdateAnnouncement from "./pages/admin/UpdateAnnouncement";
import UpdateProblem from "./pages/admin/UpdateProblem";
import UpdateSeason from "./pages/admin/UpdateSeason";
import GuestLogin from "./pages/auth/GuestLogin";
import GuestPowers from "./pages/guest/GuestPowers";

export default function App() {
  const { user, isauth, loading: authloading } = useSelector((state) => state.auth);
  const { loading: seasonloading } = useSelector((state) => state.season);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkauth()).then(() => {
      dispatch(getcurrentseason());
    });
  }, [dispatch]);

  if (authloading || seasonloading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landingpage />} />
      <Route path="/login" element={isauth ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={isauth ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="/guest-login" element={isauth ? <Navigate to="/dashboard" /> : <GuestLogin />} />

      {/*Guest Powers route*/}
      <Route path="/dashboard/guestpowers" element={isauth ? <GuestPowers /> : <Navigate to="/login" />} />

      {/* Global Protected Standalone Routes (Outside general dashboard layout framework) */}
      <Route
        path="/dashboard/solutions/:pid"
        element={isauth ? <Solution /> : <Navigate to="/login" />}
      />
      <Route
        path="/dashboard/problems/:problemId"
        element={isauth ? <ProblemDetail /> : <Navigate to="/login" />}
      />

      {/* Primary Authenticated Workspace Layout Wrapper */}
      <Route path="/dashboard" element={isauth ? <Layout /> : <Navigate to="/login" />}>
        {/* Default route index loads announcements cleanly instead of self-redirecting */}
        <Route index element={<Announcements />} />

        <Route path="problems" element={<Problems />} />

        <Route path="standings">
          <Route index element={<Standings />} />
          <Route path=":sid" element={<ThisSeason />} />
        </Route>

        <Route path="solutions" element={<Problemidsforsol />} />
        <Route path="user-rank" element={<UserRank />} />
        <Route path="profile" element={<UserProfile />} />

        {/* Nested Administrator Command Sub-System */}
        <Route path="admin" element={<AdminPanel />}>
          <Route path="showallproblems" element={<Showallproblems />} />
          <Route path="showallannouncements" element={<Showallannouncements />} />
          <Route path="showallseasons" element={<Showallseasons />} />

          <Route path="create-announcement" element={<CreateAnnouncement />} />
          <Route path="create-problem" element={<CreateProblem />} />
          <Route path="create-season" element={<CreateSeason />} />

          <Route path="update-announcement/:aid" element={<UpdateAnnouncement />} />
          <Route path="update-problem/:pid" element={<UpdateProblem />} />
          <Route path="update-season/:sid" element={<UpdateSeason />} />

          <Route path="settime" element={<SetTime />} />
        </Route>
      </Route>

      {/* Fallback Catch-All Redirect */}
      <Route path="*" element={<Navigate to={isauth ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}