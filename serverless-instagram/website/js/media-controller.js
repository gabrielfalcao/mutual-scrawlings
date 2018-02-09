var mediaController = {
    data: {
        config: null
    },
    uiElements: {
        uploadButton: null,
        uploadProgressBar: null,
        imageCardTemplate: null,
        imageList: null,
        loadingIndicator: null
    },
    init: function (configConstants) {
        this.data.config = configConstants;
        this.uiElements.uploadButton = $('#upload');
        this.uiElements.uploadButtonContainer = $('#upload-image-button');
        this.uiElements.uploadProgressBar = $('#upload-progress');

        this.wireEvents();

        this.uiElements.imageCardTemplate = $('#image-template');
        this.uiElements.imageList = $('#image-list');
        this.uiElements.loadingIndicator = $('#loading-indicator');

        // this.data.config = config;
        this.fetchFromDynamoDB();
    },
    wireEvents: function () {
        var that = this;
        this.uiElements.uploadButton.on('change', function (result) {
            let file = $('#upload').get(0).files[0];
            let requestDocumentUrl = that.data.config.apiBaseUrl + '/get_signed_url?content_type='+ encodeURI(file.type);
            let fileSizeMB = Math.round(100 * file.size / (1024 * 1024)) / 100;
            if(fileSizeMB > 1){
                alert(
                    "File cannot be greater than 1MB! The file uploaded: " + fileSizeMB
                );
                this.value = "";
            } else {

                $.get(requestDocumentUrl, function (data, status) {
                    that.upload(file, data, that)
                });

                this.value = null;
            }
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
            that.fetchFromDynamoDB();
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
    },
    addImageToScreen: function (data) {
        // clone the template image element
        var $img = this.uiElements.imageCardTemplate.clone().attr({
            'id': data.image,
        }).show();

        $img.find('img').attr('src', data.image).show();

        this.uiElements.imageList.prepend($img);
    },
    fetchFromDynamoDB: function () {
        var that = this;

        $.ajax(
            {
                url: that.data.config.apiBaseUrl + '/list',
                type: 'GET',
                processData: false
            }).done(function (data, status) {
                that.uiElements.imageList.html("");
                $.each(data, function() {
                    that.addImageToScreen(this);
                });
            });
    }
};
