import React from "react";
import Badge from "../elements/Badge";
import Resume from "../../resume.json";

// Avatar component
const Avatar = ({ src, alt, fallback }) => (
    <figure className="image container is-180x180 avatar-animation avatar">
        <img
            width="180px"
            height="180px"
            src={src}
            alt={alt}
            className="is-rounded is-centered"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallback;
            }}
        />
    </figure>
);

function AboutMe() {
    // Destructure the Resume object for better readability
    const {
        basics: { picture, name, x_pictureFallback, x_title, summary },
        interests,
    } = Resume;

    return (
        <section className="section has-bg-image4" id="aboutMe">
            <div className="container has-text-centered">
                <div className="circles-container">
                    {/* Render the Avatar component */}
                    <Avatar src={picture} alt={name} fallback={x_pictureFallback} />
                </div>

                {/* Add one line space */}
                <br />

                <p className="subtitle is-4 has-text-white-bis has-text-weight-bold">
                    {x_title}
                </p>
                <p className="subtitle is-5 has-text-white-bis has-text-weight-light summary-text">
                    {summary}
                </p>
                <div className="container interests">
                    <div className="field is-grouped is-grouped-multiline has-text-centered">
                        {interests.map((value, index) => (
                            <Badge key={index} text={value.name} faIcon={value.x_icon} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutMe;
