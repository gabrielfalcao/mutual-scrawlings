var imageController = {
    data: {
        config: null
    },
    uiElements: {
        videoCardTemplate: null,
        videoList: null,
        loadingIndicator: null
    },
    init: function (config) {
        this.uiElements.videoCardTemplate = $('#video-template');
        this.uiElements.videoList = $('#video-list');
        this.uiElements.loadingIndicator = $('#loading-indicator');

        this.data.config = config;

        this.fetchFromDynamoDB();
    },
    addVideoToScreen: function (videoObj) {
        // clone the template video element
        var newVideoElement = this.uiElements.videoCardTemplate.clone().attr('id', videoObj.image);

        this.updateVideoOnScreen(newVideoElement, videoObj);

        this.uiElements.videoList.prepend(newVideoElement);
    },
    updateVideoOnScreen: function(videoElement, videoObj) {

        videoElement.find('img').show();

        // set the video URL
        videoElement.find('img').attr('src', videoObj.image);
    },
    fetchFromDynamoDB: function () {
        var that = this;
        var request = {
            url: that.data.config.apiBaseUrl + '/list',
            type: 'GET',
            processData: false,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        }
        // console.log(request)
        $.ajax(request, function (data, status) {
            console.log(status)
            console.log(data)
            jQuery.each(data, function() {
                console.log(this)
                that.addVideoToScreen(this);
              // $("#" + i).append(document.createTextNode(" - " + val));
            });
        });
        

    }
};
