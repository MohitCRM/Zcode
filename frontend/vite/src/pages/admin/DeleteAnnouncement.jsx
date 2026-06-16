import axiosClient from "../../utils/axiosClient";
import { useForm } from "react-hook-form";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const announcementSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less")
    .trim(),
  content: z.string()
    .min(1, "Content is required"),
  category: z.enum(["Season Update", "Patch Notes", "Maintenance", "General"])
    .default("General"),
  isPinned: z.coerce.boolean().default(false),
});


export default function DeleteAnnouncement()
{
    return(
        <>
            <p>This is deleteannouncement form</p>
        </>
    )
}