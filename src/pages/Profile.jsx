import React, { useEffect, useState } from "react";
import { auth, db, logout, storage } from "../firebase"; // Import your firebase setup
import { useAuthState } from "react-firebase-hooks/auth"; // Auth state hook
import { Link, useNavigate } from "react-router-dom"; // For navigation
import { collection, getDocs, query, where } from "firebase/firestore"; // Firestore functions
import { toast, ToastContainer } from "react-toastify"; // For notifications
import "react-toastify/dist/ReactToastify.css"; // Toast styles
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; // Import storage functions

const Profile = () => {
  const [user, loading, error] = useAuthState(auth); // Get user auth state
  const [userDetails, setUserDetails] = useState(null); // State to hold user details
  const [file, setFile] = useState(null); // State to hold the uploaded file
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!user?.uid) return; // If user not found, exit
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const doc = await getDocs(q); // Fetch user details
        if (!doc.empty) {
          const data = doc.docs[0].data(); // Get the user data
          console.log(data); // Debug: Log fetched data
          setUserDetails(data); // Set the user details state

          // Fetch the existing image from storage
          const imageRef = ref(storage, `profileImages/${user.uid}`);
          const existingImageUrl = await getDownloadURL(imageRef);
          setUserDetails((prevDetails) => ({
            ...prevDetails,
            img: existingImageUrl, // Set the existing image URL
          }));
        } else {
          toast.error("No user data found"); // Error if no data
        }
      } catch (err) {
        console.error(err); // Log error
      }
    };

    if (!loading && user) {
      fetchUserDetails(); // Fetch user details if user is loaded
    } else if (!user && !loading) {
      navigate("/login"); // Redirect to login if no user
    }
  }, [loading, navigate, user]);

  const handleImageUpload = (event) => {
    const selectedFile = event.target.files[0]; // Get the selected file
    if (!selectedFile) return; // Exit if no file is selected
    setFile(selectedFile); // Set the selected file
  };

  const handleSubmit = async () => {
    if (!file) return; // Exit if no file is selected

    const oldImageRef = ref(storage, `profileImages/${user.uid}`); // Reference to the old image

    try {
      // Delete the old image
      await deleteObject(oldImageRef);
      console.log("Old image deleted successfully.");
    } catch (error) {
      console.error("Error deleting old image:", error); // Log any errors
    }

    const newImageRef = ref(storage, `profileImages/${user.uid}`); // Create a reference to the new image location
    try {
      await uploadBytes(newImageRef, file); // Upload the new file
      const downloadURL = await getDownloadURL(newImageRef); // Get the new file URL
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        img: downloadURL, // Update the img field with the new URL
      }));
      toast.success("Profile picture updated successfully!"); // Notify success
      setFile(null); // Clear the file input
    } catch (error) {
      console.error("Error uploading new image:", error); // Log any errors
      toast.error("Failed to upload new image"); // Notify failure
    }
  };

  const handleRemove = () => {
    setFile(null); // Clear the selected file
  };

  if (!userDetails) {
    return <div>Loading...</div>; // Show loading if details not yet fetched
  }

  return (
    <div className="flex-col items-center justify-center">
      {error && <p>{error.message}</p>} {/* Display any errors */}
      <div className="flex items-center justify-between py-5">
        <Link to={"/"}>
          <button className="bg-purple-700 text-white text-xs sm:text-base rounded-full py-2 px-5">
            Form Page
          </button>
        </Link>
        <button
          onClick={logout} // Logout button
          className="bg-purple-700 text-white text-xs sm:text-base rounded-full py-2 px-5"
        >
          Logout
        </button>
      </div>
      <h1 className="text-4xl mb-4 text-center">Profile Page</h1>
      <div className="border-[1px] border-gray-300" />
      <div className="flex flex-col justify-center bg-gray-100 p-3 sm:p-5 mt-5 rounded-xl">
        <div className="flex h-[150px] w-[150px] mb-2">
          <img
            src={file ? URL.createObjectURL(file) : userDetails.img || "https://via.placeholder.com/150"}
            alt="user-img"
            className="rounded-full w-[100%] h-[100%] object-cover" // Ensure the image covers the area
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-2 mb-2 w-full" // Adjust width and margin
          style={{ padding: "4px", fontSize: "12px" }} // Optional: make input smaller
        />
        {file && (
          <div className="flex space-x-2">
            <button
              onClick={handleRemove} // Button to remove the selected file
              className="bg-red-500 text-white rounded-full py-1 px-3 text-xs"
            >
              Remove
            </button>
            <button
              onClick={handleSubmit} // Button to submit the new image
              className="bg-blue-500 text-white rounded-full py-1 px-3 text-xs"
            >
              Submit
            </button>
          </div>
        )}
        <div className="flex-col items-center justify-center p-1 sm:p-5">
        
          <div className="font-semibold text-lg">
            First Name : <span className="text-purple-500">{userDetails.firstName}</span>
          </div>
          <div className="font-semibold text-lg">
            Last Name : <span className="text-purple-500">{userDetails.lastName}</span>
          </div>

          <div className="font-semibold text-lg">
            Email : <span className="text-purple-500">{userDetails.email}</span>
          </div>
          <div className="font-semibold text-lg">
            Age : <span className="text-purple-500">{userDetails.age}</span>
          </div>
          <div className="font-semibold text-lg">
            Profession : <span className="text-purple-500">{userDetails.profession}</span>
          </div>
          <div className="flex-col font-semibold text-lg">
            Address : <span className="text-purple-500">{userDetails.address}</span>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Profile;
