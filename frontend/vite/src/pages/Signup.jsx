import { useForm  } from "react-hook-form";
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { registerUser } from "../slicers/authslice";
import { useEffect } from "react";


//schema for sign up form validation
const signupschema = z.object({
    firstName : z.string().min(3,"Name should contain atleast 3 characters"),
    emailId : z.string().email(),
    password : z.string().min(8,"Password should contain atleast 8 characters")

});


export default function Signup(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {loading,error, isauth} = useSelector((state)=>state.auth);

    const {register, handleSubmit, formState:{errors}} = useForm({resolver : zodResolver(signupschema)});
    
    useEffect(()=>{
        if(isauth){
            navigate('/');
        }
    },[isauth]);

    const onsubmit = (data) =>{
        dispatch(registerUser(data));
    };

    return(
       <>
        <form  className = "min-h-screen flex flex-col justify-center item-center gap-y-2 max-w-xl ml-50" onSubmit={handleSubmit(onsubmit) } >
        
        <input {...register('firstName')} placeholder="Enter your Name"/>
        {errors.firstName ? (<span>{errors.firstName.message}</span>) : null}

        <input {...register('emailId')} placeholder="Enter your Email" />
        {errors.emailId ? (<span>{errors.emailId.message}</span>) : null}

        <input {...register('password')} placeholder="Enter your Password" type="password" />
        {errors.password ? (<span> {errors.password.message} </span>) : null}

        <button type="submit" className="btn">Submit</button>
        </form>
       </>
    )
}