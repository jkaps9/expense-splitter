import React, { forwardRef, InputHTMLAttributes } from "react";

import styles from "@styles/Forms.module.css";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
  isInvalid?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      name,
      label,
      errorMessage = "",
      isInvalid = false,
      className,
      ...props
    },
    ref,
  ) => {
    const inputId = id || name;
    const errorId = `${inputId}-error`;
    const isCurrentlyInvalid = isInvalid || Boolean(errorMessage);

    return (
      <div className={`${styles.inputGroup} ${className || ""}`.trim()}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <input
          id={inputId}
          name={name}
          ref={ref}
          aria-describedby={isCurrentlyInvalid ? errorId : undefined}
          aria-invalid={isCurrentlyInvalid}
          {...props}
          className={styles.input}
        />
        {isCurrentlyInvalid && errorMessage && (
          <p id={errorId} className={styles.errorMessage}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

export default FormInput;
