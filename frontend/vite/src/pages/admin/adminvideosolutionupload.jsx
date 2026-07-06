import { useParams } from "react-router";
import { useState } from "react";
import {useForm} from "react-hook-form";
import axios from "axios";
import axiosClient from "../../utils/axiosClient";

function Adminvideosolutionupload() {
    const {pid} = useParams();

    const [uploading,setUploading] = useState(false);
    const [uploadProgress,setUploadProgress] = useState(0);
    const [uploadVideo,setUploadVideo] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        formState :{errors},
        reset,
        setError,
        clearErrors
    } = useForm();

    const selectefile = watch('videoFile')?.[0];

    // Format duration helper
    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const onSubmit = async (data)=>{
        const file = data.videoFile[0];

        setUploading(true);
        setUploadProgress(0);
        clearErrors();

        try{
            const signatureresponse = await axiosClient.get(`/videosolution/createuploadsignature/${pid}`);
            const {signature, timestamp, public_id, api_key, upload_url} = signatureresponse.data;

            const formData = new FormData();
            formData.append('file',file);
            formData.append('signature',signature);
            formData.append('timestamp',timestamp);
            formData.append('public_id',public_id);
            formData.append('api_key',api_key);

            const uploadResponse = await axios.post(upload_url,formData, {
                headers :{
                    'Content-Type' : 'multipart/form-data',
                },
                onUploadProgress : (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setUploadProgress(progress);
                }
            })
            
            const cloudinaryResult = uploadResponse.data;

            const metadataResponse = await axiosClient.post(`/videosolution/save`,{
                problemId : pid,
                cloudinaryPublicId: cloudinaryResult.public_id,
                secureUrl: cloudinaryResult.secureUrl,
                duration : cloudinaryResult.duration
            })

            setUploadVideo(metadataResponse.data.videoSolution);
            reset();
        }catch (err) {
          console.error('Upload error:', err);
          setError('root', {
            type: 'manual',
            message: err.response?.data?.message || 'Upload failed. Please try again.'
          });
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-[#0C1220] border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Upload Video Solution</h2>
                <p className="text-slate-400 text-sm mb-8">Select a video file to upload as the solution for this problem.</p>

                {errors.root && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                        {errors.root.message}
                    </div>
                )}

                {uploadVideo && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex flex-col gap-1">
                        <h3 className="font-bold text-emerald-300">Upload Successful!</h3>
                        <p>Duration: {formatDuration(uploadVideo.duration)}</p>
                        <p>Uploaded: {new Date(uploadVideo.createdAt || Date.now()).toLocaleString()}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="relative group cursor-pointer">
                        <input 
                            type="file" 
                            accept="video/*" 
                            {...register('videoFile', { 
                                required: 'Please select a video file',
                                validate: {
                                    isVideo: (files) => {
                                        if (!files || !files[0]) return 'Please select a video file';
                                        return files[0].type.startsWith('video/') || 'Please select a valid video file';
                                    },
                                    fileSize: (files) => {
                                        if (!files || !files[0]) return true;
                                        return files[0].size <= 100 * 1024 * 1024 || 'File size must be less than 100MB';
                                    }
                                }
                            })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={uploading}
                        />
                        <div className={`flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-xl transition-all ${selectefile ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-700 bg-[#121826] group-hover:border-slate-500 group-hover:bg-[#161F30]'}`}>
                            <svg className={`w-10 h-10 mb-3 ${selectefile ? 'text-indigo-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {selectefile ? (
                                <>
                                    <p className="text-white text-sm font-medium">{selectefile.name}</p>
                                    <p className="text-slate-400 text-xs mt-1">{(selectefile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-slate-300 text-sm font-medium">Click or drag video to upload</p>
                                    <p className="text-slate-500 text-xs mt-1">MP4, WebM or OGG</p>
                                </>
                            )}
                        </div>
                    </div>
                    {errors.videoFile && <p className="text-rose-500 text-xs">{errors.videoFile.message}</p>}

                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400 font-mono">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-[#121826] rounded-full h-2 overflow-hidden border border-slate-800">
                                <div className="bg-indigo-500 h-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={uploading || !selectefile}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        {uploading ? 'Uploading Video...' : 'Upload Video Solution'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Adminvideosolutionupload;