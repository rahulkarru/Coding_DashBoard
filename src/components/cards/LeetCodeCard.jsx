import React from "react";
import BasePlatformCard from "./BasePlatformCard";

const LeetCodeCard = ({ totalSolved, hard, peakRating, link, medium, easy }) => {
  const chips = [
    easy !== undefined ? `Easy ${easy}` : null,
    medium !== undefined ? `Medium ${medium}` : null,
    hard !== undefined ? `Hard ${hard}` : null,
  ].filter(Boolean);

  return (
    <BasePlatformCard
      platformName="LeetCode"
      title="LeetCode"
      big={totalSolved}
      mid="Total Solved"
      sub={`Contest Rating: ${peakRating}`}
      link={link}
      chips={chips}
    />
  );
};

export default LeetCodeCard;
