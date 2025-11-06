import React from "react";
import BasePlatformCard from "./BasePlatformCard";

const CodeChefCard = ({ currentRating, starRating, peakRating, link }) => {
  const chips = starRating && starRating !== "N/A" ? [starRating] : [];
  return (
    <BasePlatformCard
      platformName="CodeChef"
      title="CodeChef"
      big={currentRating}
      mid={starRating}
      sub={`Peak: ${peakRating}`}
      link={link}
      chips={chips}
    />
  );
};

export default CodeChefCard;
