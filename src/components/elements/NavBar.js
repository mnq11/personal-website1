import React from "react";
import MenuItem from "./MenuItem";
import Resume from "../../resume.json";
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


        const classes = ['flicker', 'fast-flicker1', 'flickerGray', 'fast-flicker2'];

        const getRandomClass = () => {
            return classes[Math.floor(Math.random() * classes.length)];
        };


        const getRandomColor = () => {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };
        const characterArray = Resume.basics.name.split("").map((char) => ({
            character: char,
            className: getRandomClass(),
            color: getRandomColor(),
        }));
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
                                {characterArray.map(({character, className, color}, index) => (
                                    <span key={index} className={className} style={{color}}>{character}</span>
                                ))}
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
