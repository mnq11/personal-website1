import React from "react";
import SkillsList from "../elements/SkillsList";
import Resume from "../../resume.json";

function Skills() {
    return (
        <section className="hero is-dark is-fullheight has-bg-image1">
        <section className="section" id="skills">

            <div className="container">
                <h1 className="title">Skills</h1>
                <div className="columns">
                    <div className="column is-2.5">
                        <div className="has-text-centered">
              <span className="icon has-text-link">
                <i className="fas fa-3x fa-solid fa-user"></i>
              </span>
                            <h2 className="title is-5"> Front-end </h2>
                        </div>
                        <SkillsList
                            skills={Resume.skills
                                .filter(skill => skill.keywords.includes("Front-end"))
                                .reduce((obj, item) => {
                                    obj[item.name] = item.level;
                                    return obj;
                                }, {})}
                        />

                    </div>
                    <div className="column is-2.5">
                        <div className="has-text-centered">
              <span className="icon has-text-link">
                <i className="fas fa-3x fa-solid fa-hat-wizard"></i>
              </span>
                            <h2 className="title is-5"> Back-end  ️</h2>
                        </div>
                        <SkillsList
                            skills={Resume.skills
                                .filter(skill => skill.keywords.includes("Back-end"))
                                .reduce((obj, item) => {
                                    obj[item.name] = item.level;
                                    return obj;
                                }, {})}
                        />

                    </div>

                    <div className="column is-2.5">
                        <div className="has-text-centered">
              <span className="icon has-text-link">
                <i className="fas fa-3x fa-solid fa-database"></i>
              </span>
                            <h2 className="title is-5"> Database </h2>
                        </div>
                        <SkillsList
                            skills={Resume.skills
                                .filter(skill => skill.keywords.includes("Database"))
                                .reduce((obj, item) => {
                                    obj[item.name] = item.level;
                                    return obj;
                                }, {})}
                        />

                    </div>
                    <div className="column is-2.5">
                        <div className="has-text-centered">
              <span className="icon has-text-link">
                <i className="fas fa-3x fa-cogs"></i>
              </span>
                            <h2 className="title is-5"> DevOps </h2>
                        </div>
                        <SkillsList
                            skills={Resume.skills
                                .filter(skill => skill.keywords.includes("DevOps"))
                                .reduce((obj, item) => {
                                    obj[item.name] = item.level;
                                    return obj;
                                }, {})}
                        />
                    </div>

                    <div className="column is-2.5">
                        <div className="has-text-centered">
              <span className="icon has-text-link">
                <i className="fas fa-3x fa-duotone fa-mobile"></i>
              </span>
                            <h2 className="title is-5"> Mobile APP </h2>
                        </div>
                        <SkillsList
                            skills={Resume.skills
                                .filter(skill => skill.keywords.includes("Mobile APP"))
                                .reduce((obj, item) => {
                                    obj[item.name] = item.level;
                                    return obj;
                                }, {})}
                        />

                    </div>

                </div>
            </div>
        </section>
        </section>


    );
}

export default Skills;
