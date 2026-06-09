import { useForm  } from "react-hook-form";
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "../slicers/authslice";
import { useEffect } from "react";
import { useSelector } from "react-redux";

//schema for sign up form validation
const signupschema = z.object({
    emailId : z.string().email("Invalid email"),
    password : z.string().min(8,"Password should contain atleast 8 characters")

});


export default function Login(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {loading,error, isauth} = useSelector((state)=>state.auth);

    const {register, handleSubmit, formState:{errors}} = useForm({resolver : zodResolver(signupschema)});
    
    useEffect(()=>{
        if(isauth)
            navigate('/');
    },[isauth]);

    const onsubmit = (data) =>{
        dispatch(loginUser(data));
    };

    return(
       <>
        <form  className = "min-h-screen flex flex-col justify-center item-center gap-y-2 max-w-xl ml-50" onSubmit={handleSubmit(onsubmit) } >

        <input {...register('emailId')} placeholder="Enter your Email" />
        {errors.emailId ? (<span>{errors.emailId.message}</span>) : null}

        <input {...register('password')} placeholder="Enter your Password" type="password" />
        {errors.password ? (<span> {errors.password.message} </span>) : null}

        <button type="submit" className="btn">Submit</button>
        </form>
       </>
    )
}