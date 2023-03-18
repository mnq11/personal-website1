import React from "react";
import ProgressBar from "./ProgressBar";

function SkillsList(props) {
  const { skills } = props;

  function buildSkills(skills) {
    return Object.entries(skills).map(([key, value]) => (
        <li key={key}>
          <ProgressBar text={key} level={value} />
        </li>
    ));
  }

  return <ul className="skill-list">{buildSkills(skills)}</ul>;
}

export default SkillsList;
