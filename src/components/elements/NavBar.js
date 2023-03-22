import React from "react";
import MenuItem from "./MenuItem";
import favicon from '../../components/myfacicon/favicon.ico';


class NavBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showMenu: false,
        };

        this.handleMenuClick = this.handleMenuClick.bind(this);
    }

    handleMenuClick() {
        this.setState((prevState) => ({
            showMenu: !prevState.showMenu,
        }));
    }

    render() {

        return (
            <nav className="navbar is-transparent">
                <div className="container">
                    <div className="navbar-brand">
                        <a href="/" className="navbar-item title is-unselectable my-name">
                            {/*add favicon and make it to the left of the sign*/}
                            <img className="favicon" src={favicon} alt="logo"/>
                            {/*add space */}
                            {/* Replace space span with CSS */}
                            <style>{`.my-name { margin-left: 8px; }`}</style>

                            <div className="sign">
                            {/*   add Title */}
                                <div className="subtitle is-5 has-text-weight-light">Mohammed Nabil</div>
                            </div>


                        </a>
                    </div>
                    <span
                        className="navbar-burger burger"
                        onClick={this.handleMenuClick}
                    >
              <span></span>
              <span></span>
              <span></span>
            </span>

                    <div
                        className={
                            'navbar-menu nav-menu ' +
                            (this.state.showMenu ? 'is-active' : '')
                        }
                    >
                        <div className="navbar-end" onClick={this.handleMenuClick}>
                            <MenuItem text="About Me" href="#aboutMe"/>
                            <MenuItem text="Skills" href="#skills"/>
                            <MenuItem text="Experience" href="#experience"/>
                            <MenuItem text="Articles" href="#articles"/>
                        </div>
                    </div>

                </div>
            </nav>
        );
    }
}

export default NavBar;
