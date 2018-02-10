var ImageCardHelper = {
    render: function(url, description){
        var $new = $('#image-template').clone().attr({
            'id': url,
        }).show();

        $new.find('img').attr('src', url).show();
        $new.find('.metadata').text(description);
        return $new;
    },
    extractInformation(data) {
        /** prepare image information **/

        // parse date from unix timestamp
        var uploadDate = moment(data.createdAt, "x");

        // extract username from email
        var username = data.user.split("@", 1)[0];

        // generate a description
        var description = [uploadDate.fromNow(), "by", username].join(" ");

        // return the final result
        var result = {
            url: data.image,
            description: description
        };
        return result;
    }
}

var UI = {
    showError: function(message) {
        alert(message);
    },
    UploadButton: {
        show: function() {
            $('#upload-image-button').show()
            return this;
        },
        hide: function() {
            $('#upload-image-button').hide()
            return this;
        },
        bindEvents: function(onFileSelected){
            $("#upload").on('change', function (event) {
                let file = $('#upload').get(0).files[0];
                let fileSizeMB = Math.round(100 * file.size / (1024 * 1024)) / 100;
                if(fileSizeMB > 1){
                    var message = [
                        "File cannot be greater than 1MB!",
                        "The file uploaded:",
                        "" + fileSizeMB + ""
                    ].join(' ')
                    UI.showError(message)
                } else {
                    onFileSelected(file)
                }
            });
        }
    },
    Image: {
        add: function(data) {
            var info = ImageCardHelper.extractInformation(data)
            $card = ImageCardHelper.render(info.url, info.description)
            UI.Gallery.add($card);
            return this;
        }
    },
    Gallery: {
        add: function($card) {
            return $('#image-list').append($card);
        },
        clear: function() {
            return $('#image-list').empty();
        }
    },
    UploadProgress: {
        show: function(){
            $('#upload-progress').show()
            return this;
        },

        hide: function(){
            $('#upload-progress').hide()
            return this;
        },
        reset: function() {
            return this.update(0)
        },
        update: function(percentage) {
            $('#upload-progress').find('.progress-bar').css('width', percentage + '%');
            return this;
        }
    }
}

var HttpRequest = {
    handleProgress: function(evt) {
        var percentage = evt.loaded / evt.total * 100;
        UI.UploadProgress.update(percentage);
    },
    factory: function() {
        var xhr = $.ajaxSettings.xhr();
        xhr.addEventListener('progress', HttpRequest.handleProgress);
        xhr.upload.addEventListener('progress', HttpRequest.handleProgress);
        return xhr;
    }
}

var S3 = {
    uploadImage: function(signedUrl, file) {
        return $.ajax({
            url: signedUrl,
            type: 'PUT',
            data: file,
            processData: false,
            contentType: file.type,
            beforeSend: function(xhr) {
            },
            xhr: HttpRequest.factory,
        })
    }
}

var Lambda = {
    getSignedS3Url: function(url, accessToken) {
        return $.ajax({
            url: url,
            type: 'GET',
            beforeSend: function(xhr) {
                var bearer = ['Bearer', accessToken].join(' ');
                xhr.setRequestHeader('Authorization', bearer);
            }
        })

    },
    getImageListFromDynamoDB: function(url, accessToken){
        return $.ajax({
            url: url,
            type: 'GET',
            processData: false,
            beforeSend: function(xhr) {
                var bearer = ['Bearer', accessToken].join(' ');
                xhr.setRequestHeader('Authorization', bearer);
            }
        })
    }
}

var mediaController = {
    config: null,
    uiElements: {
        uploadButton: null,
        uploadProgressBar: null,
        imageCardTemplate: null,
        imageList: null,
    },
    init: function (configConstants) {
        this.config = configConstants;
        this.wireEvents();
        this.fetchFromDynamoDB();
    },
    wireEvents: function () {
        UI.UploadButton.bindEvents(function(file){
            let url = this.config.apiBaseUrl + '/get_signed_url?content_type='+ encodeURI(file.type);
            var token = localStorage.getItem('userToken');
            Lambda.getSignedS3Url(url, token).then(function(data, textStatus){
                this.upload(file, data)
            }.bind(this));
        }.bind(this));
    },
    upload: function (file, data) {
        // hide upload controls and show progress bar set to 0
        UI.UploadButton.hide()
        UI.UploadProgress.show().reset();

        S3.uploadImage(data.url, file).then(function(data, textStatus){
            // show upload controls and hide progress bar
            UI.UploadButton.show()
            UI.UploadProgress.hide();

            switch (textStatus) {
                case "success":
                    setTimeout(function(){
                        this.fetchFromDynamoDB();
                    }.bind(this), 5000);
                    break;
                case "error":
                case "timeout":
                case "parsererror":
                case "abort":
                default:
                    UI.showError("failed to upload");
                    break;
            }
        }.bind(this));
    },
    fetchFromDynamoDB: function () {
        var url = this.config.apiBaseUrl + '/list';
        var token = localStorage.getItem('userToken');

        Lambda.getImageListFromDynamoDB(url, token).then(function (unordered, status) {
            console.log(unordered)
            UI.Gallery.clear();
            var images = unordered.sort(function(a, b){
                return parseFloat(b.createdAt, 10) - parseFloat(a.createdAt, 10);
            });
            $.each(images, function(index, data) {
                UI.Image.add(data);
            });
        });
    }
};
