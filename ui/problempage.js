import {useState,useEffect} from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../../utils/axiosClient';
import { logoutUser } from '../../slicers/authslice';

export default function Problems() {

    const dispatch = useDispatch();
    const {user} = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [solvedProblems,setSolvedProblems] = useState([]);
    const [filters,setFilters] = useState({
        difficulty: 'all',
        tag: 'all',
        status: 'all'
    });

    useEffect(()=>{
        const fetchproblems = async ()=>{
            try{
                const {data} = axiosClient.get('/problem/getallproblems');
                setProblems(data);
            }
            catch(err)
            {
                console.error('Error fetching problems : ', err);
            }
        };

        const fetchSolvedProblems = async ()=>{
            try{
                const {data} = await axiosClient.get('/problem/')
            }catch(err)
        {
            
        }
        } 
    })

    const handleLogout = ()=>{
        dispatch(logoutUser());
        setSolvedProblems([]);
    };

    return (
        <>
            <nav className = "navbar bg-base-100 shadow-lg px-4" >
                <div className='flex-1' >
                    <NavLink to='/' className="btn btn-ghost text-xl"  ></NavLink>
                </div>
                <div className="flex-none gap-4" >
                    <div className="dropdown dropdown-end" ></div>
                    <div tabIndex={0} className="btn btn-ghost"  >
                        {user?.firstName}
                    </div>
                    <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52" >
                        <li><button onClick={handleLogout} >Logout</button>  </li>
                    </ul>
                </div>
            </nav>



        </>
    )
}

