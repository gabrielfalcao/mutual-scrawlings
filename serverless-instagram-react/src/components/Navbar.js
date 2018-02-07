import React, { Component } from 'react';

class Navbar extends Component {
    render() {
        return (
            <nav className="navbar navbar-inverse">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="/">
                            Serverless Instagram
                        </a>
                    </div>
                    <form className="navbar-form navbar-right">
                        <button id="auth0-login" type="submit" className="btn btn-success">Sign In</button>
                    </form>
                </div>
            </nav>
        );
    }
}

export default Navbar;
