import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import request from 'superagent'
import Navbar from './components/Navbar'

import popcorn from './popcorn.png'
import {AuthStorage} from './utils'


const API_BASE_URL = "https://94rvjnepk3.execute-api.us-east-1.amazonaws.com/dev"

class App extends Component {
    constructor(props) {
        super(props);

        const token = AuthStorage.getToken()
        const profile = AuthStorage.getProfile()

        this.state = {
            previewImage: null,
            userToken: token,
            userProfile: profile,
            isUploading: false
        };
    }
    onRequestUpload(acceptedFiles, rejectedFiles) {
        if (acceptedFiles.length < 1) {
            // TODO: show an error to the user
            return;
        }
        const {userToken} = this.state;
        const file = acceptedFiles[0];
        const url = `${API_BASE_URL}/get_signed_url`
        const bearer = `Bearer ${userToken}`
        console.log(`requesting signed S3 url for file ${file.name} with ${bearer}`, url)

        request
               .get(url)
               .set({
                   "Accept": "application/json",
                   "Authorization": bearer
               })
               .query({filename: file.name})
               .withCredentials()
               .on("error", (error) => {
                   console.error("failed to sign URL:")
                   console.error(error)
               })
               .then((response, status) => {
                   console.log(response, status)
                   console.log('url signed successfully', response)
                   this.performUpload(response.url, file);
               })
    }
    performUpload(signedUrl, file) {
        this.setState({
            previewImage: file.preview,
            isUploading: true
        })

        const upload = request.put(signedUrl);
        upload.attach(file.name, file);
        upload.end(this.onUploadFinished);
    }
    onUploadFinished(error, response) {
        if (error) {
            console.error("failed to upload file", error)
        }

        if (response.ok) {
            this.setState({
                previewImage: null,
                isUploading: false
            })
            console.log('success uploading file')
        }
    }
    onAuthenticationChanged(token, profile) {
        this.setState({
            userToken: token,
            userProfile: profile,
        })
        if (token == null) {
            this.setState({
                isUploading: false,
                previewImage: null,
            })
        }
    }
    render() {
        const {auth0Config} = this.props;
        const {userProfile, isUploading} = this.state;
        const showDropzone = userProfile != null && !isUploading;

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
            {showDropzone ? <Dropzone className="mx-auto d-block" onDrop={this.onRequestUpload.bind(this)} accept="image/*">
    <span className="btn btn-info ">
        <span className="oi oi-plus"></span>
        </span>

                    </Dropzone> : null}
                    {this.state.previewImage != null ? <img src={this.state.previewImage} alt="preview" /> : null}
                </div>
            </div>
        );
    }
}

export default App;
