import axiosClient from "../../utils/axiosClient";
import { useForm } from "react-hook-form";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


export default function UpdateProblem()
{
    return(
        <>
            <p>This is updateproblem form</p>
        </>
    )
}