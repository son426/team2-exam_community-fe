import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, user } from "../../store/atoms";
import { authCheck, writeComment, getPost, deletePost } from "../../api";
import { useForm } from "react-hook-form";
import { IconSend } from "../molecules/atoms/icons";
import PostMainContents from "../molecules/PostMainContents";
import Comments from "../molecules/Comments";
import { PostMain, PostMoreBtn } from "../molecules/atoms/styled";
import {
  CommentForm,
  CommentInput,
  CommentButton,
} from "../molecules/atoms/styled";
import Loading from "../molecules/Loading";
import SearchBar from "../molecules/SearchBar";
import {
  TopBarContainer,
  TopContainer,
  TopBarMenu,
  TopBarMain,
  TopBarBtns,
  PostMenuBar,
  PostMenuBtn,
} from "../molecules/atoms/styled";
import { IconBackBtn, IconMoreBtn } from "../molecules/atoms/icons";
import TopBarBack from "../molecules/TopBarBack";
import TopBar from "../molecules/TopBar";

interface IForm {
  comment: string;
}

export interface IPost {
  c_date: string | null;
  d_date: string | null;
  m_date: string | null;
  click_num: number;
  comment_num: number;
  content: string;
  hide_user: boolean;
  id: number;
  like: number;
  num: number;
  title: string;
  user_id: string;
}

export interface IComment {
  user_id: string;
  content: string;
  c_date: string;
}
interface IPostState {
  state: {
    postId: number;
    boardName: string;
  } | null;
}

export interface IPostData {
  post_detail: IPost;
  post_comments: IComment[];
}

function Post() {
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useRecoilState(user);
  const [isOptions, setIsOptions] = useState(false);
  const { register, handleSubmit, reset } = useForm<IForm>();
  const [postData, setPostData] = useState<IPostData | null>();
  const { state } = useLocation() as IPostState;
  const postId = state?.postId;
  const boardName = state?.boardName;
  const navigate = useNavigate();
  const params = useParams();

  const handleDelete = () => {
    if (window.confirm("글을 삭제하시겠습니까?")) {
      // 삭제 처리
      deletePost(postId);
      alert("해당 글을 삭제합니다."); //
      // 페이지 이동
      navigate(-1);
    } else {
      // doing nothing
    }
  };

  const handleEdit = () => {
    // 수정 페이지로 이동
    navigate(`/posts/${postId}/fix`, { state: { data: postData } });
  };
  function onSubmit(data: IForm) {
    reset();

    writeComment(data.comment, `${postData?.post_detail.id}`);
    window.location.reload();
  }

  console.log("postData :", postData);

  useEffect(() => {
    const checkUserAuth = async () => {
      const authData = await authCheck();
      const authStatus = authData["isAuthenticated"];
      const authName = authData["username"];
      setIsLoggedIn(authStatus);
      setUserName(authName);
      setIsLoading(false);
    };
    const paintPost = async () => {
      if (postId) {
        const post = await getPost(postId);
        setPostData(post as unknown as IPostData | null);
        console.log("post :", post);
      }
    };

    if (state === null) {
      navigate("/");
      console.log("navigate to mainpage (state===null)");
    } else {
      checkUserAuth();
      paintPost();
    }
    console.log("postData :", postData);
    console.log("로그인한 유저 :", userName);

    console.log("이글을 쓴 사용자 : ", postData?.post_detail.user_id);
  }, []);

  const onBack = () => {
    navigate(-1);
  };
  const onOptions = () => {
    setIsOptions((current) => !current);
  };

  return postData ? (
    <>
      <TopBar
        id={undefined}
        mainService={"코코볼"}
        needWrite={true}
        needSearch={true}
      />
      {/* ----------Top Bar---------- */}
      <PostMain>
        <PostMoreBtn>
          <IconMoreBtn onClick={onOptions} />
        </PostMoreBtn>
        <PostMainContents
          post={postData?.post_detail}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
        <Comments comments={postData?.post_comments} />
        <CommentForm onSubmit={handleSubmit(onSubmit)}>
          <CommentInput
            {...register("comment", {
              required: "댓글을 입력해주세요",
            })}
            type="comment"
            name="comment"
          />
          <CommentButton type="submit">
            <IconSend />
          </CommentButton>
        </CommentForm>
      </PostMain>
      {/* ----------Post Main---------- */}
      {isOptions ? (
        isLoggedIn ? (
          <PostMenuBar>
            {/* <PostMenuBtn>
              <Link to={`/posts/${postId}/fix`} state={{ data: postData }}>
                수정
              </Link>
            </PostMenuBtn>
            <PostMenuBtn>삭제</PostMenuBtn> */}
            <PostMenuBtn>URL 복사</PostMenuBtn>
          </PostMenuBar>
        ) : (
          <PostMenuBar>
            <PostMenuBtn>신고</PostMenuBtn>
            <PostMenuBtn>URL 복사</PostMenuBtn>
          </PostMenuBar>
        )
      ) : null}
    </>
  ) : (
    <Loading />
  );
}

export default Post;
