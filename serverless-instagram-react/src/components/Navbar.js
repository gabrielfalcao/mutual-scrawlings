import React, { Component } from 'react';
import Auth0Lock from 'auth0-lock'


class Navbar extends Component {
    constructor(props) {
        super(props);

        const {auth0Config} = props;
        const {domain, clientId} = auth0Config;
        this.lock = new Auth0Lock(clientId, domain)

        const token = localStorage.getItem('token');
        const jsonProfile = localStorage.getItem('profile');
        const profile = JSON.parse(jsonProfile)

        this.state = {
            token: token,
            profile: profile,
        };
        console.log("Navbar.constructor", token, profile)
    }
    storeTokenAndProfile(token, profile) {
        const jsonProfile = JSON.stringify(profile)
        // Save the JWT token.
        localStorage.setItem('token', token)
        // Save the profile
        localStorage.setItem('profile', jsonProfile)

        // update the state
        this.setState({
            token: token,
            profile: profile,
        });

        this.authenticationDidChange(token, profile)

    }
    authenticationDidChange(token, profile) {
        const {onAuthenticationChanged} = this.props;

        if (onAuthenticationChanged) {
            onAuthenticationChanged(token, profile);
        }

    }
    componentWillMount() {
        const {lock} = this;
        console.log(lock);
        lock.on("authenticated", (authResult) => {
            // Use the token in authResult to getUserInfo() and save it to localStorage
            lock.getUserInfo(authResult.accessToken, (error, profile) => {
                if (error) {
                    console.error("lock.getUserInfo", "Something went wrong: ", error);
                    return;
                }
                this.storeTokenAndProfile(authResult.accessToken, profile)
                lock.hide()
            });
        });
    }
    processLoginSucceeded(token, profile) {
        this.storeTokenAndProfile(token, profile)
        console.log("processLoginSucceeded", token, profile)
    }
    onClickLogin() {
        const {lock} = this
        lock.show((error, profile, token) => {
            if (error) {
                console.error("Navbar.onClickLogin", "Something went wrong: ", error);
            } else {
                this.processLoginSucceeded(token, profile)
            }
        })
    }
    onClickLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        this.authenticationDidChange(null, null)

        // refresh page
        window.location.href = window.location.href;
    }

    render() {
        const {profile} = this.state;

        return (
            <nav className="navbar navbar-dark bg-dark">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="/">
                            Serverless Instagram
                        </a>
                    </div>
                    <form className="navbar-form navbar-right">
                        {profile != null ? <button type="button" onClick={this.onClickLogout.bind(this)} className="btn btn-warning"><img src={profile.picture} height="24" alt={profile.nick} /> &nbsp; Logout</button> : <button type="button" onClick={this.onClickLogin.bind(this)} className="btn btn-success">Sign In</button>}
                    </form>
                </div>
            </nav>
        );
    }
}

export default Navbar;
