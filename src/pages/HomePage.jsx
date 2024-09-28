import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, logout, app } from "../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "./PopupModal.jsx";

const defaultProfilePic = "https://www.example.com/default_profile_pic.png";

const initialState = {
  firstName: "",
  lastName: "",
  address: "",
  age: "",
  profession: "",
  img: defaultProfilePic,
};

const HomePage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [progress, setProgress] = useState(false);
  const [data, setData] = useState(initialState);
  const [isSubmit, setIsSubmit] = useState(false);
  const [file, setFile] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (data.firstName === "") {
      toast.error("First Name is required!");
      return;
    }
    if (data.lastName === "") {
      toast.error("Last Name is required!");
      return;
    }
    if (data.address === "") {
      toast.error("Enter your Address!");
      return;
    }
    if (data.profession === "") {
      toast.error("Enter your Profession!");
      return;
    }
    if (data.age === "") {
      toast.error("Age is required!");
      return;
    }
    if (!file) {
      toast.error("Profile picture is required!");
      return;
    }

    setIsSubmit(true); // Disable button to prevent multiple submissions

    const storage = getStorage(app);
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
        if (progress === 100) {
          toast.success("Profile picture uploaded successfully");
        }
      },
      (error) => {
        alert(error.message);
        toast.error(`${error.message}`);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        // Set the img URL in the data state
        setData((prev) => ({ ...prev, img: downloadURL }));

        // Now submit the user data to Firestore
        await addDoc(collection(db, "users"), {
          ...data,
          email: user.email,
          uid: user.uid,
          img: downloadURL,
          timestamp: serverTimestamp(),
        });

        setOpenModal(true); // Open modal after successful submission

        // Redirect to profile page after a delay
        setTimeout(() => {
          navigate("/profile");
        }, 5000); // 5 seconds delay
      }
    );
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/login");
  }, [user, loading, navigate]);

  return (
    <div className="-z-10">
      {error && <div>{error}</div>}
      <div className="flex items-center justify-between py-4">
        <Link to={"/profile"}>
          <button className="bg-purple-700 text-white text-xs sm:text-base px-5 py-2 rounded-full">
            Profile
          </button>
        </Link>
        <button
          onClick={logout}
          className="bg-purple-700 text-white text-xs sm:text-base rounded-full py-2 px-5"
        >
          Logout
        </button>
      </div>
      <div className="border-[1px] border-gray-300" />
      <h1 className="text-purple-700 p-3 mt-3 text-center text-base xs:text-xl font-black">
        Hello {user && user.email}{" "}
      </h1>
      <h2 className="mt-1 text-2xl text-center">User Details Form </h2>
      <p className="mb-2 text-center text-gray-500">
        Fill all the details to create your profile
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center"
      >
        {["firstName", "lastName", "address", "profession", "age"].map((field) => (
          <label className="relative" key={field}>
            <input
              type="text"
              name={field}
              value={data[field]}
              onChange={handleChange}
              className="my-2 mx-1 w-[270px] xs:w-[360px] md:w-[450px] px-6 py-3 rounded-full outline-none border-[1px] border-gray-400 focus:border-purple-500 transition duration-200"
            />
            <span className="absolute top-5 text-gray-500 left-0 mx-6 px-2 transition duration-300">
              {data[field] ? "" : field.charAt(0).toUpperCase() + field.slice(1)}
            </span>
          </label>
        ))}

        <div className="flex flex-col items-center justify-center gap-3 my-5 ">
          <label>Upload Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="border-[1px] p-2 w-[200px]"
          />
        </div>

        <button
          disabled={isSubmit}
          className="mt-10 mb-4 bg-purple-700 text-white text-xs sm:text-base rounded-full py-3 px-12 transition duration-200 hover:scale-110 disabled:bg-purple-400 disabled:scale-100"
          type="submit"
        >
          {isSubmit ? "Submitting..." : "Submit"}
        </button>
      </form>
      <ToastContainer />
      <PopupModal open={openModal} name={data.firstName} /> {/* Pass open state and name */}
    </div>
  );
};

export default HomePage;
