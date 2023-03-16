import React from "react";

function Footer() {
  return (
      <footer className="footer has-bg-image4">
        <div className="content has-text-centered has-text-white">

          <p>
            Let's connect on
            <a href="https://www.linkedin.com/in/mohammed-nabil-48b539107/" className="has-text-white">
              <i>  </i>
              <i className=" fab fa-linkedin"> </i> LinkedIn
            </a>
            <p>  </p>
            <a href="mailto:mnq_77@yahoo.com" className="has-text-white">
              <i className="far fa-envelope"></i>    Email me and discuss the next big thing!
            </a>
          </p>
          <p>
            &copy; 2023  <a href="https://github.com/mnq11" className="has-text-white">
            <strong> Mohammed Nabil</strong>
          </a>. All rights reserved.
          </p>
        </div>
      </footer>


  );
}

export default Footer;
