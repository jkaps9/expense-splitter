import FormInput from "@components/FormInput";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";
import { useNavigate } from "react-router";
import AuthForm from "@components/AuthForm";

export default function NewGroupMember() {
  const navigate = useNavigate();

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: { name: "", description: "", default_currency: "" },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.name) newErrors.name = "Can't be empty";
      if (!values.default_currency)
        newErrors.default_currency = "Can't be blank";
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
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: values.name,
          description: values.description,
          default_currency: values.default_currency,
        })
        .select()
        .single();

      if (groupError || !group) {
        alert(groupError?.message || "Failed to create group");
        return;
      } else {
        const { error: memberError } = await supabase
          .from("group_members")
          .insert({
            group_id: group.id,
            user_id: user.id,
          });

        if (memberError) {
          alert(memberError.message);
        } else {
          navigate(`${import.meta.env.BASE_URL}/groups/${group.id}`);
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
          label="Member's Display Name"
          type="text"
          placeholder="Display name"
          onChange={handleChange}
          errorMessage={errors.name}
          value={formData.name}
          required
        ></FormInput>
      </AuthForm>
    </>
  );
}
