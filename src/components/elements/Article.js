import React from "react";

// Consolidated darkCardStyle and whiteColor to a single object
const cardStyles = {
    container: {
        backgroundColor: "#333",
    },
    textColor: {
        color: "white",
    },
};

function Article(props) {
    return (
        <div className="card" style={cardStyles.container}>
            <div className="card-header">
                <a href={props.url} target="_blank" rel="noopener noreferrer" style={cardStyles.textColor}>
                    <p className="card-header-title" style={cardStyles.textColor}>{props.title}</p>
                </a>
                <a
                    href={props.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-header-icon"
                    aria-label="Dev Community"
                    style={cardStyles.textColor}
                >
                    <span className="icon">
                        <i className="fab fa-2x fa-dev"></i>
                    </span>
                </a>
            </div>
            <div className="card-image">
                <figure className="image">
                    <img width="1000" height="420" src={props.image} alt="" />
                </figure>
            </div>
            <div className="card-content">
                <h1 className="heading" style={cardStyles.textColor}>DEV.TO</h1>
                <div className="content" style={cardStyles.textColor}>
                    <p>{props.extract}</p>
                </div>
                <a href={props.url} target="_blank" rel="noopener noreferrer" style={cardStyles.textColor}>
                    Read the full article
                </a>
            </div>
        </div>
    );
}

export default Article;
