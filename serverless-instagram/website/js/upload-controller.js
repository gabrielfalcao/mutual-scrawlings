var uploadController = {
    data: {
        config: null
    },
    uiElements: {
        uploadButton: null,
        uploadProgressBar: null,
        videoCardTemplate: null,
        videoList: null,
        loadingIndicator: null
    },
    init: function (configConstants) {
        this.data.config = configConstants;
        this.uiElements.uploadButton = $('#upload');
        this.uiElements.uploadButtonContainer = $('#upload-video-button');
        this.uiElements.uploadProgressBar = $('#upload-progress');

        this.wireEvents();

        this.uiElements.videoCardTemplate = $('#video-template');
        this.uiElements.videoList = $('#video-list');
        this.uiElements.loadingIndicator = $('#loading-indicator');

        // this.data.config = config;
        this.fetchFromDynamoDB();
    },
    wireEvents: function () {
        var that = this;
        this.uiElements.uploadButton.on('change', function (result) {
            var file = $('#upload').get(0).files[0];
            var requestDocumentUrl = that.data.config.apiBaseUrl + '/get_signed_url?content_type='+ encodeURI(file.type);

            $.ajaxSetup({
                'beforeSend': function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
                }
            });

            $.get(requestDocumentUrl, function (data, status) {
                that.upload(file, data, that)
            });

            this.value = null;
        });
    },
    upload: function (file, data, that) {
        this.uiElements.uploadButtonContainer.hide();
        this.uiElements.uploadProgressBar.show();
        this.uiElements.uploadProgressBar.find('.progress-bar').css('width', '0');

        $.ajaxSetup({
            'beforeSend': function (xhr) {
            }
        });

        $.ajax({
            url: data.url,
            type: 'PUT',
            data: file,
            processData: false,
            contentType: file.type,
            xhr: this.progress
        }).done(function (response) {
            that.uiElements.uploadButtonContainer.show();
            that.uiElements.uploadProgressBar.hide();
            setTimeout(function () {
                that.fetchFromDynamoDB();
            }, 5000);
        }).fail(function (response) {
            that.uiElements.uploadButtonContainer.show();
            that.uiElements.uploadProgressBar.hide();
            alert('Failed to upload');
        });
        $.ajaxSetup({
            'beforeSend': function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
            }
        });
    },
    progress: function () {

        var xhr = $.ajaxSettings.xhr();
        xhr.upload.onprogress = function (evt) {
            var percentage = evt.loaded / evt.total * 100;
            $('#upload-progress').find('.progress-bar').css('width', percentage + '%');
        };
        return xhr;
    },addVideoToScreen: function (videoObj) {
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

        $.ajax(
            {
                url: that.data.config.apiBaseUrl + '/list',
                type: 'GET',
                processData: false
            }).done(function (data, status) {
                that.uiElements.videoList.html("");
                $.each(data, function() {
                    that.addVideoToScreen(this);
                });
        });
    }
};
