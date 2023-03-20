import React from "react";
import NavBar from "./NavBar";
import Resume from "../../resume.json";

// SocialIcon component
const SocialIcon = ({ url, network, icon }) => (
    <div className="column has-text-centered">
        <a href={url} target="blank" className="is-hovered" title={network}>
      <span className="icon is-medium is-">
        <i className={icon}></i>
      </span>
        </a>
    </div>
);

function Hero() {
    // Destructure the Resume object for better readability
    const {
        basics: { label, location, profiles },
    } = Resume;

    return (
        <section className="hero is-dark is-fullheight has-bg-image">
            <div className="hero-head">
                <NavBar />
            </div>
            <div className="hero-body">
                <div className="container">
                    <p className="subtitle is-5 has-text-weight-light">I'm a</p>
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
                    <h2 className="subtitle">
                        {location.region}, {location.country}
                    </h2>
                </div>
            </div>
            <div className="hero-foot">
                <div className="container">
                    <div className="columns is-mobile is-centered">
                        {/* Render the SocialIcon components */}
                        {profiles.map((profile, index) => (
                            <SocialIcon
                                key={index}
                                url={profile.url}
                                network={profile.network}
                                icon={profile.x_icon}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
