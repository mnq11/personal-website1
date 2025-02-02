import React from "react";
import MenuItem from "./MenuItem";
import Resume from "../../resume.json";

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
        // divide String into 4 Strings
        // 1. first 5 characters
        // 2. 5th to 9th characters
        // 3. 9th to 15th characters
        // 4. 15th to 24th characters
        const name = Resume.basics.name.substring(0, 4);
        const name2 = Resume.basics.name.substring(4, 8);
        const name3 = Resume.basics.name.substring(8, 12);
        const name4 = Resume.basics.name.substring(12, 14);

        return (
            <nav className="navbar is-transparent">
                <div className="container">
                    <div className="navbar-brand">
                        <a href="/" className="navbar-item title is-unselectable my-name">
                            <div className="sign">
                                <span className="flicker">{name}</span>
                                <span className="fast-flicker1">{name2}</span>
                                <span className="flicker">{name3}</span>
                                <span className="fast-flicker2">{name4}</span>
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

                    <button
                        className="navbar-burger burger"
                        aria-label="menu"
                        aria-expanded="false"
                        onClick={this.handleMenuClick}
                    >
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </button>

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
