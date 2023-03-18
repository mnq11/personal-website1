import React, { Component } from "react";
import Article from "../elements/Article";

class Articles extends Component {
    constructor(props) {
        super();
        this.state = { articles: [] };
    }

    componentDidMount() {
        const devTo = "https://dev.to/api/articles?username=mnq11";

        fetch(devTo)
            .then(response => {
                return response.json();
            })
            .then(data => {
                // Filter out duplicate articles based on their 'id'
                const uniqueData = Array.from(new Set(data.map(article => article.id)))
                    .map(id => {
                        return data.find(article => article.id === id);
                    });

                let articles = [];
                if (uniqueData.length >= 4) {
                    uniqueData.slice(-4);
                } else {
                    uniqueData.slice(-2);
                }
                uniqueData.forEach((element, index) => {
                    articles.push(
                        <div className="column" key={`article-${index}`}>
                            <Article
                                key={`article-element-${index}`}
                                title={element.title}
                                url={element.url}
                                image={element.cover_image}
                                extract={element.description}
                            />
                        </div>
                    );
                });
                var offset = 4 - uniqueData.length;
                for (var i = 0; i < offset; i++) {
                    articles.push(<div className="column" key={`empty-column-${i}`}></div>);
                }
                this.setState({ articles: articles });
            });
    }

    render() {
        return (
            <section className="hero is-dark is-fullheight has-bg-image3">
                <section className="section" id="articles">
                    <div className="container">
                        <h1 className="title">Articles</h1>
                        <h2 className="subtitle is-4">My latest articles</h2>
                        <div className="columns ">{this.state.articles}</div>
                    </div>
                </section>
            </section>
        );
    }
}

export default Articles;
