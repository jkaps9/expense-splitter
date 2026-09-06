import FormInput from "@components/FormInput";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";
import { useNavigate, useLocation } from "react-router";
import AuthForm from "@components/AuthForm";

export default function NewGroupMember() {
  const navigate = useNavigate();
  const location = useLocation();

  const groupId = location.state?.groupDetails.id;

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: { name: "", email: "" },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.name) newErrors.name = "Can't be empty";
      return newErrors;
    },
    onSubmit: async (values) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate(`${import.meta.env.BASE_URL}`);
        return;
      }

      if (!values.email || values.email === "") {
        const { data: groupMember, error: groupMemberError } = await supabase
          .from("group_members")
          .insert({
            group_id: groupId,
            user_id: null,
            guest_name: values.name,
          })
          .select()
          .single();

        if (groupMemberError || !groupMember) {
          alert(groupMemberError?.message || "Failed to create group");
          return;
        } else {
          navigate(`${import.meta.env.BASE_URL}/groups/${groupId}`);
        }
      }
    },
  });

  return (
    <>
      <AuthForm
        title="Add Member"
        description="Add member to group"
        onSubmit={handleSubmit}
        submitText="Add"
      >
        <FormInput
          id="memberName"
          name="name"
          label="Name"
          type="text"
          placeholder="name"
          onChange={handleChange}
          errorMessage={errors.name}
          value={formData.name}
          required
        ></FormInput>
        <FormInput
          id="email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="Email address (optional)"
          value={formData.email}
          onChange={handleChange}
          errorMessage={errors.email}
          autoComplete="off"
        />
      </AuthForm>
    </>
  );
}
