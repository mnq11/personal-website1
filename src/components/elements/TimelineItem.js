import React from "react";

function TimelineItem(props) {
    return (
        <div className="timeline-item is-success">
            <div className="timeline-marker is-image is-32x32">
                <img src="" alt=""/>
            </div>
            <div className="timeline-content">



                <p className="heading ">{props.date}</p>
                {/*<h1 className="title is-4">{props.company}</h1>*/}
                <span className="title is-9  flickerGray">{props.company}</span>
                <p className="heading ">{props.position}</p>
                <p style={{maxWidth: "25em"}}>{props.summary}</p>

            </div>
        </div>
    );
}

export default TimelineItem;
