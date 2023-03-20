import React from "react";

const progress = {
    Beginner: 20,
    Intermediate: 40,
    Advanced: 60,
    Expert: 80,
    Master: 100
};


function ProgressBar(props) {


    return (
        <div>

            <span className="title is-6 is-spaced fast-flicker1">{props.text}</span>
            <span className="subtitle is-6 skill-percentage ">{props.level}</span>
            <progress
                className="progress is-success"
                value={progress[props.level]}
                max="100"
            >
                {progress[props.level]}%

            </progress>
        </div>
    );
}

export default ProgressBar;
