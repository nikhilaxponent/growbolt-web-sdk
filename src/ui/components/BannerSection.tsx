import React from "react";

type Props = {
  image?: string;
  children?: React.ReactNode;
};

export default function BannerSection({ image, children }: Props) {
  return (
    <div className="sdk-banner rounded-t-2xl overflow-hidden">
      <div className="sdk-banner-bg" />
      {image ? (
        <img src={image} alt="banner" className="sdk-banner-img" />
      ) : (
        <div className="sdk-banner-center">{children}</div>
      )}
    </div>
  );
}

