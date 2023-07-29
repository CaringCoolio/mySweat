import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from "axios";
import { AuthContext } from '../helpers/AuthContext';


function Home() {
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios.get("http://localhost:3001/posts", { headers: { accessToken: localStorage.getItem("accessToken") } }).then((response) => {
        setListOfPosts(response.data.listOfPosts);
        setLikedPosts(response.data.likedPosts.map((like) => {
          return like.PostId;
        }));
      });
    }
  }, []);

  const likeAPost = (postId) => {
    axios.post(
      "http://localhost:3001/likes",
      { PostId: postId },
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    )
      .then((response) => {
        setListOfPosts(
          listOfPosts.map((post) => {
            if (post.id === postId) {
              if (response.data.liked) {
                return { ...post, Likes: [...post.Likes, 0] };
              } else {
                const likesArray = post.Likes;
                likesArray.pop();
                return { ...post, Likes: likesArray };
              }
            } else {
              return post;
            }
          })
        );

        if (likedPosts.includes(postId)) {
          setLikedPosts(likedPosts.filter((id) => id !== postId));
        } else {
          setLikedPosts([...likedPosts, postId]);
        }
      });
  };

  return (
    <div>
  

      {listOfPosts.map((value, key) => {
        return (
          <div key={key} className="post">
            <div className="title"> {value.title} </div>
            <div
              className="body"
              onClick={() => {
                navigate(`/post/${value.id}`);
              }}
            >
              {value.postText}
            </div>
            <div className="footer">
              <div className="username">
                <Link to={`/profile/${value.UserId}`}>{value.username}</Link>
              </div>
              <div className="buttons">
                <FavoriteIcon
                  onClick={() => {
                    likeAPost(value.id);
                  }}
                  className={likedPosts.includes(value.id) ? "likeBttn" : "unlikeBttn"}
                ></FavoriteIcon>
              </div>
              <label> {value.Likes.length}</label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;