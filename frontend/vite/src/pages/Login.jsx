import { useForm  } from "react-hook-form";
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';

//schema for sign up form validation
const signupschema = z.object({
    emailId : z.string().email("Invalid email"),
    password : z.string().min(8,"Password should contain atleast 8 characters")

});


export default function Login(){
    const {register, handleSubmit, formState:{errors}} = useForm({resolver : zodResolver(signupschema)});
    
    const submitteddata = (data) =>{
        console.log(data);
    };

    return(
       <>
        <form  className = "min-h-screen flex flex-col justify-center item-center gap-y-2 max-w-xl ml-50" onSubmit={handleSubmit(data => console.log(data)) } >

        <input {...register('emailId')} placeholder="Enter your Email" />
        {errors.emailId ? (<span>{errors.emailId.message}</span>) : null}

        <input {...register('password')} placeholder="Enter your Password" type="password" />
        {errors.password ? (<span> {errors.password.message} </span>) : null}

        <button type="submit" className="btn">Submit</button>
        </form>
       </>
    )
}