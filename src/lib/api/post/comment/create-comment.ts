"use server"

import { instance } from "@/lib/axios/axiosInstance";

export type Comment = {
  commentId: string,
  comment: string,
  userId: string,
  username: string,
  status: string,
  createdAt: Date,
  updatedAt: Date
}

export type CommentDTO = {
  postId: string,
  comment: string,
  parentId?: string | null
}

export type CommentState = {
  errors?: {
    comment?: string[];
  };
  message?: string | null;
  success: boolean;
};

export async function createComment(prevState: CommentState, formData: FormData) {
  const comment = formData.get("comment") as string;
  const postId = formData.get("postId") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!comment || !postId) {
    return {
      errors: {
        comment: ['Comment is required']
      },
      message: 'Missing Fields. Failed to Create Comment.',
      success: false,
    };
  }

  try {
    const response = await instance.post("/post-service/comments", {
      postId,
      comment,
      parentId
    });

    console.log(response)

    if (!response.data.success) {
      return {
        errors: {},
        message: '서버에러입니다.',
        success: false,
      }
    }

    return {
      errors: {},
      message: null,
      success: true,
    }
  } catch (error) {
    console.error(error);
    return {
      errors: {},
      message: 'Failed to create comment.',
      success: false,
    };
  }
}