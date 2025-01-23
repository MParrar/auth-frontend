import React, { useContext, useState } from "react";
import { NewUserForm } from "../components/NewUserForm";
import AuthContext from "../contexts/AuthProvider";
import { isValidEmail } from "../utils/validations";

const initialFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
}

export const Register = () => {
  const { createUser } = useContext(AuthContext);

  const [form, setForm] = useState(initialFormValues);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    validateNewUserForm(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: "user",
    });
    setError({})
    setForm(initialFormValues)
  };

  const validateNewUserForm = (name, value) => {
    const newErrors = { ...error };
    if (name === "name" && !value) {
      newErrors.name = "Name is required";
    } else if (
      name === "email" &&
      !isValidEmail(value)
    ) {
      newErrors.email = "Invalid email format";
    } else if (name === "password" && value.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (name === "confirmPassword" && value !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
    } else {
      delete newErrors[name];
    }
    setError(newErrors);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6" data-testid="register-heading">Register</h2>
        <div className="text-black">
          <NewUserForm
            showLinks={true}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            form={form}
            setForm={setForm}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};
