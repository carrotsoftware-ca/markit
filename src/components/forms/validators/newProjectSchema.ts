import * as yup from "yup";

const newProjectSchema = yup.object().shape({
  name: yup
    .string()
    .required("Project name is required")
    .max(50, "Max 50 characters"),
  description: yup
    .string()
    .required("Description is required")
    .max(200, "Max 200 characters"),
  client_email: yup
    .string()
    .email("Must be a valid email")
    .required("Client email is required"),
  emailNotifications: yup
    .boolean()
    .required(),
  notifications: yup
    .boolean()
    .required(),
});

export default newProjectSchema;
