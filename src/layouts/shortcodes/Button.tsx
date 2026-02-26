import DynamicIcon from "@/helpers/DynamicIcon";
import React from "react";

type ButtonProps = {
  label: string;
  link: string;
  style?: string;
  rel?: string;
  icon?: string;
  className?: string;
  enable?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  label,
  link,
  style,
  rel,
  icon,
  className = "",
  enable = true,
}) => {
  if (!enable) return null;

  return (
    <a
      href={link}
      target={link.startsWith("http") ? "_blank" : "_self"}
      rel={`noopener noreferrer ${rel ? (rel === "follow" ? "" : rel) : "nofollow"
        }`}
      className={`btn ${style === "dark" ? "btn-dark" : "btn-underline"
        } ${className}`}
    >
      {icon && <DynamicIcon className="inline mr-1" icon={icon} />}
      {label}
    </a>
  );
};

export default Button;
