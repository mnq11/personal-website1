import React, { useState, useEffect } from "react";
import Badge from "../elements/Badge";
import Resume from "../../resume.json";
import soundFile from "./sound/Reading Music Waves to Loop for 1 hour For the best Relaxation by Easy Listening Background Music Reading Music Company  Reading Background Music Playlist on Apple Music.mp3";
import useSound from "use-sound";

const Avatar = ({ src, alt, fallback, onClick }) => (
    <figure
        className="image container is-180x180 avatar-animation avatar"
        onClick={onClick}
    >
        <img
            width="180"
            height="180"
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
    const {
        basics: { picture, name, x_pictureFallback, x_title, summary },
        interests,
    } = Resume;

    const [isPlaying, setIsPlaying] = useState(false);
    const [play, { stop }] = useSound(soundFile, { volume: 0.5 });

    useEffect(() => {
        if (isPlaying) {
            play();
        } else {
            stop();
        }
    }, [isPlaying, play, stop]);

    return (
        <section className="section has-bg-image4" id="aboutMe">
            <div className="container has-text-centered">
                <div className="circles-container">
                    <Avatar
                        src={picture}
                        alt={name}
                        fallback={x_pictureFallback}
                        onClick={() => setIsPlaying(!isPlaying)}
                    />
                </div>
                <br />
                <p className="subtitle is-4 has-text-white-bis has-text-weight-bold">
                    {x_title}
                </p>
                <p className="subtitle is-5 has-text-white-bis has-text-weight-light summary-text">
                    {summary}
                </p>
                <div className="container interests">
                    <div className="field is-grouped is-grouped-multiline has-text-centered">
                        {interests.map((interest, index) => (
                            <Badge key={index} text={interest.name} faIcon={interest.x_icon} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutMe;
