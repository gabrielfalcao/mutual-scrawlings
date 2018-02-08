class AuthStorage {
    static getProfile(){
        const jsonProfile = localStorage.getItem('profile');
        const profile = JSON.parse(jsonProfile)
        return profile
    }
    static getToken() {
        const token = localStorage.getItem('token');
        return token
    }
    static storeToken(token) {
        localStorage.setItem('token', token)
    }
    static storeProfile(profile) {
        localStorage.setItem('profile', JSON.stringify(profile))
    }
}

export {AuthStorage};
