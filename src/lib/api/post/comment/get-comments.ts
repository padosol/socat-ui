"use server"

import { instance } from "@/lib/axios/axiosInstance";

export type Comment = {
  commentId: string;
  comment: string;
  userId: string;
  username: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}

export async function getComments(postId: string) {
  
  try {
    const response = await instance.get(`/post-service/posts/${postId}/comments`);

    console.log(response.data)
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }
} 