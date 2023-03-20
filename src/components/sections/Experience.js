import React from "react";

import Timeline from "../elements/Timeline";

function Experience() {
    let label = "Experience";
    return (
        <section className="hero is-dark is-fullheight has-bg-image2">

            <section className="section" id="experience">
                <div className="container">
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
                    <div className="scantiness"></div>
                </div>
        <Timeline  />
      </div>
            </section>

        </section>
    );
}

export default Experience;
