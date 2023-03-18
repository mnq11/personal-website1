import React from "react";

function Article(props) {
    const darkCardStyle = {
        backgroundColor: "#333",
    };

    const whiteColor = {
        color: "white",
    };

    return (
        <div className="card" style={darkCardStyle}>
            <div className="card-header">
                <a href={props.url} target="blank" style={whiteColor}>
                    <p className="card-header-title"  style={whiteColor}>{props.title}</p>
                </a>
                <a
                    href={props.url}
                    target="blank"
                    className="card-header-icon"
                    aria-label="Dev Community"
                    style={whiteColor}
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
                <h1 className="heading" style={whiteColor}>DEV.TO</h1>
                <div className="content" style={whiteColor}>
                    <p>{props.extract}</p>
                </div>
                <a href={props.url} target="blank" style={whiteColor}>
                    Read the full article
                </a>
            </div>
        </div>
    );
}

export default Article;
