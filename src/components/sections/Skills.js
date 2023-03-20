import React from "react";
import SkillsList from "../elements/SkillsList";
import Resume from "../../resume.json";

// Helper function to generate skills object
const generateSkillsObject = (skills, keyword) => {
    return skills
        .filter((skill) => skill.keywords.includes(keyword))
        .reduce((obj, item) => {
            obj[item.name] = item.level;
            return obj;
        }, {});
};

// SkillColumn component
const SkillColumn = ({ icon, title, skills }) => (
    <div className="column is-2.5">
        <div className="has-text-centered">
      <span className="icon has-text-link">
        <i className={`fas fa-3x ${icon}`}></i>
      </span>
            <h2 className="title is-5">{title}</h2>
        </div>
        <SkillsList skills={skills} />
    </div>
);

function Skills() {
    const { skills } = Resume;

    let label = "Skills";
    return (
        <section className="hero is-dark is-fullheight has-bg-image3">
            <section className="section" id="skills">
                <div className="container">
                    <div className="container">
                        <h1 className="title">
                            <div className="container">
                                <div className="container">
                                    <div className="glitch" data-text={label}>
                                        {label}
                                    </div>
                                    <div className="glow">{label}</div>
                                </div>
                                <div className="scantiness"></div>
                            </div>
                        </h1>
                    </div>

                    {/*<h1 className="title">Skills</h1>*/}
                    <div className="columns">
                        <SkillColumn
                            icon="fa-solid fa-user"
                            title="Front-end"
                            skills={generateSkillsObject(skills, "Front-end")}
                        />
                        <SkillColumn
                            icon="fa-solid fa-hat-wizard"
                            title="Back-end"
                            skills={generateSkillsObject(skills, "Back-end")}
                        />
                        <SkillColumn
                            icon="fa-solid fa-database"
                            title="Database"
                            skills={generateSkillsObject(skills, "Database")}
                        />
                        <SkillColumn
                            icon="fa-solid fa-cogs"
                            title="DevOps"
                            skills={generateSkillsObject(skills, "DevOps")}
                        />
                        <SkillColumn
                            icon="fa-duotone fa-mobile"
                            title="Mobile APP"
                            skills={generateSkillsObject(skills, "Mobile APP")}
                        />
                    </div>
                </div>
            </section>
        </section>
    );
}

export default Skills;
