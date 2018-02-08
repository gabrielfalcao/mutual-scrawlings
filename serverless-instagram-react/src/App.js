import React, { Component } from 'react'
import Dropzone from 'react-dropzone'

import Navbar from './components/Navbar'

import popcorn from './popcorn.png'

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            previewImage: null,
            userToken: null,
            userProfile: null,
        };
    }
    onDrop(acceptedFiles, rejectedFiles) {
        if (acceptedFiles.length > 0) {
            let image = acceptedFiles[0];
            this.setState({
                previewImage: image.preview
            })
        }
        console.log("Accepted Files", acceptedFiles);
    }
    onAuthenticationChanged(token, profile) {
        this.setState({
            userToken: token,
            userProfile: profile,
        })
    }
    render() {
        const {auth0Config} = this.props;
        const {userProfile} = this.state;

        return (
            <div className="App">
                <Navbar auth0Config={auth0Config}
                        onAuthenticationChanged={this.onAuthenticationChanged.bind(this)}/>

                <div className="jumbotron">
                    <div className="container">
                        <img src={popcorn} alt="popcorn" height="128" className="float-left" />
                        <h1>All videos. All the time.</h1>
                        <p>Guaranteed 100% server free.</p>
                    </div>
                </div>

                <div className="container">
                    {userProfile != null ? <Dropzone className="mx-auto d-block" onDrop={this.onDrop.bind(this)} accept="video/*,image/*">
                        <p style={{height: "300px", backgroundColor: "#CCC"}}>Drag-and-drop your image or video here...</p>
                    </Dropzone> : null}
                    {this.state.previewImage != null ? <img src={this.state.previewImage} alt="preview" /> : null}
                    {/* <button className="btn btn-info ">
                        <span class="oi oi-plus"></span>
                        </button> */}
                </div>
            </div>
        );
    }
}

export default App;
