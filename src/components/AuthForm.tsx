import React from "react";
import formStyles from "@styles/Forms.module.css";

interface AuthFormProps {
  title: string;
  description: string;
  submitText: string;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export default function AuthForm({
  title,
  description = "",
  submitText,
  onSubmit,
  children,
  footerContent,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className={formStyles.form}>
      <header className={formStyles.header}>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <section className={formStyles.section}>{children}</section>
      <footer className={`${formStyles.footer}`}>
        <button type="submit" className="btn btn--primary">
          {submitText}
        </button>
        {footerContent && (
          <div className={formStyles.footerContent}>{footerContent}</div>
        )}
      </footer>
    </form>
  );
}
