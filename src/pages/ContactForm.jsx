import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify"; // For notifications
import "react-toastify/dist/ReactToastify.css"; // Toast styles

const ContactForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(true); // State for form visibility
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issue: "",
  });

  // Open/Close form modal
  const handleFormToggle = () => {
    setIsFormOpen(!isFormOpen); // Toggle modal visibility
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update form data
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "e1300ab1-0d40-4baf-b9a8-6713a4e6e4a3", // Your Web3Forms Access Key
          ...formData, // Form data (name, email, issue)
        }),
      });

      if (response.ok) {
        toast.success("Your issue has been submitted! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          issue: "",
        }); // Clear form fields after submission
      } else {
        toast.error("There was an error. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit your request.");
    }
  };

  return (
    <div className="flex-col items-center justify-center">
      {/* Button to open the form */}

      {/* Modal for the form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3 relative">
            {/* Close button */}
            <button
              onClick={handleFormToggle}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-purple-700 text-center">
              Contact Us
            </h2>

            {/* Contact Us form */}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div>
                <label htmlFor="name" className="block text-lg text-purple-700 font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-lg text-purple-700 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="issue" className="block text-lg text-purple-700 font-semibold">
                  Describe your issue
                </label>
                <textarea
                  id="issue"
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Please describe your issue..."
                />
              </div>

              <button
                type="submit"
                className="bg-purple-700 text-white rounded-full py-2 px-5 mt-4"
              >
                Submit
              </button>
            </form>

            <ToastContainer />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
