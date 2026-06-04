/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { sanitizeContent } from "../../utils/sanitizeContent";

type Props = {
  value: any;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

export default function RichContent({
  value,
  className,
  as: Tag = "div",
}: Props) {
  const { content, isHtml } = sanitizeContent(value);

  if (!content) return null;

  if (isHtml) {
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <Tag className={className}>{content}</Tag>;
}
