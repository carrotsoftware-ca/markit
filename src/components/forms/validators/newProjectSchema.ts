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
});

export default newProjectSchema;
