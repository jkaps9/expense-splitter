import { useState, useEffect, useRef } from "react";
import MenuIcon from "@assets/settings.svg?react";
import styles from "@styles/ActionMenu.module.css";

interface Action {
  label: string;
  onClick: () => void;
  isDestructive: boolean;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
}

interface ActionMenuProps {
  actions: Action[];
  ariaLabel: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function ActionMenu({
  actions,
  ariaLabel = "Open options menu",
  triggerRef,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalButtonRef = useRef<HTMLButtonElement | null>(null);
  const buttonRef = triggerRef || internalButtonRef;
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wasOpen = useRef(false);
  const shouldReturnFocus = useRef(true);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !(e.target instanceof Node && containerRef.current.contains(e.target))
      ) {
        shouldReturnFocus.current = true;
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && itemRefs.current[0]) {
      itemRefs.current[0].focus();
      wasOpen.current = true;
      shouldReturnFocus.current = true;
    } else if (!isOpen && wasOpen.current && buttonRef.current) {
      // Return focus to the trigger button when closed
      if (shouldReturnFocus.current) {
        buttonRef.current.focus();
      }
      wasOpen.current = false;
    }
  }, [isOpen, buttonRef]);

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleMenuKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % actions.length;
      itemRefs.current[nextIndex]?.focus();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + actions.length) % actions.length;
      itemRefs.current[prevIndex]?.focus();
    }
  };

  const handleActionSelect = (onClick: () => void) => {
    shouldReturnFocus.current = false;
    onClick();
    setIsOpen(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.relatedTarget)
    ) {
      setIsOpen(false);
    }
  };
  return (
    <div className="action-menu" ref={containerRef} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.actionMenuTrigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
      >
        <MenuIcon aria-hidden="true"></MenuIcon>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={styles.actionMenuDropdown}
          role="menu"
          aria-orientation="vertical"
        >
          {actions.map((action, index) => (
            <div key={action.label}>
              <button
                key={action.label}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={`${action.isDestructive ? "destructive" : ""}`}
                onClick={() => handleActionSelect(action.onClick)}
                onKeyDown={(e) => handleMenuKeyDown(e, index)}
              >
                {action.icon && <action.icon aria-hidden="true" />}
                {action.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
