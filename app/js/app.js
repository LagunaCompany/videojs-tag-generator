(function(){

	var app = angular.module('videoTag', [
		'ngRoute',
		'ngAnimate',
		'ui.tinymce'
	]);

	app.controller('VideoTagController', function($scope, $location, $http){

		var videoTagCtrl = this,
			VideoJsInstance = null;

		// Basic defaults
		videoTagCtrl.video = {
			autoplay: false,
			controls: true,
			dataSetup: {
				children: {
					posterImage: true,
					textTrackDisplay: true,
					loadingSpinner: true,
					bigPlayButton: true,
					controlBar: true
				}
			},
			id: null,
			preload: "auto",
			skinClass: '',
			trackedVideoName: null
		};

		videoTagCtrl.videoJsSkins = {
			'vjs-skin-ts-custom-2': 'http://www.topshop.com/wcsstore/ConsumerDirectStorefrontAssetStore/images/colors/color7/v3/css/videojs/vjs-skin-ts-custom-2.css',
			'vjs-skin-ts-custom-1': 'http://www.topshop.com/wcsstore/ConsumerDirectStorefrontAssetStore/images/colors/color7/v3/css/videojs/vjs-skin-ts-custom-1.css',
			'vjs-default-skin': 	'http://www.topshop.com/wcsstore/ConsumerDirectStorefrontAssetStore/images/colors/color7/v3/css/videojs/video-js.css',
		};

		videoTagCtrl.video.skinClass = Object.keys(videoTagCtrl.videoJsSkins)[0].toString();

		$scope.tinymceOptions = {
	      selector: "textarea",
		    theme: "modern",
		    plugins: [
		        "advlist autolink lists link image charmap print preview hr anchor pagebreak",
		        "searchreplace wordcount visualblocks visualchars code fullscreen",
		        "insertdatetime media nonbreaking save table contextmenu directionality",
		        "emoticons template paste textcolor"
		    ],
		    toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
		    toolbar2: "print preview media | forecolor backcolor emoticons",
		    image_advtab: true,
		    templates: [
		        {title: 'Test template 1', content: 'Test 1'},
		        {title: 'Test template 2', content: 'Test 2'}
		    ]
	    };

	    // If page matches the current location, return customClass
		$scope.menuClass = function(page, customClass) {
			var current = $location.path().substring(1);
			return page === current ? customClass : "";
		};

		// Change the current app view to whatever is passed in via 'view'
		$scope.changeView = function(view){
            $location.path(view); // path not hash
        };

        // Return an ID attribute suitable for a video tag
		$scope.getVideoId = function(){
			return 'video-js-' + Date.now();
		};

		// Update the model with a new video ID
        $scope.updateVideoId = function(){
			$scope.videoTagCtrl.video.id = $scope.getVideoId();
		};

		// Take a stylesheet URL and load it into the page
		$scope.loadStylesheet = function(url){

    		// Create DOM element
    		var linkElement = document.createElement("link");

		    // Set element attrs, including the href
		    linkElement.rel = "stylesheet";
		    linkElement.type = "text/css";
		    linkElement.href = url;

		    // Appending the element to the head tag loads the stylesheet
		    document.getElementsByTagName("head")[0].appendChild(linkElement);

		};

		// Get query string value from a URL
		$scope.getQueryStringValue = function (parameter, url, upperCase) {
			var path = (upperCase == true)? (url || location.href) : (url || location.href).toLowerCase(),
				key = (upperCase == true)? parameter.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]") : parameter.toLowerCase().replace(/[\[]/, "\\[").replace(/[\]]/, "\\]"), 
				regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
				results = regex.exec(path);
				
			if (results !== null) {
				return results[1];		
			}
			else {
				return null;		
			}
		};

		// Grab the code from the final code output and append it to the preview modal.
		$('[data-target="#codePreview"]').click(function(){

			// Load the selected Video.js skin upfront
			$scope.loadStylesheet(videoTagCtrl.videoJsSkins[videoTagCtrl.video.skinClass]);

			// The preview video element
			var previewVideoTag = document.createElement('video');

			// Set attrs - may need additional checking if props are initially undefined
			previewVideoTag.setAttribute('id', 			$scope.getVideoId());
			previewVideoTag.setAttribute('class', 		'video-js ' + videoTagCtrl.video.skinClass);
			previewVideoTag.setAttribute('data-setup', 	JSON.stringify(videoTagCtrl.video.dataSetup));
			previewVideoTag.setAttribute('width', 		videoTagCtrl.video.width);
			previewVideoTag.setAttribute('height', 		videoTagCtrl.video.height);
			previewVideoTag.setAttribute('preload', 	videoTagCtrl.video.preload);

			/* For controls and autoplay, don't set an attribute to its literal value.
				E.g. if controls='false' is set, the browser will still render controls.
				If the value is false, it's best to skip setting an attribute at all. */
			if(videoTagCtrl.video.controls){
				previewVideoTag.setAttribute('controls', 'controls');
			}
			if(videoTagCtrl.video.autoplay){
				previewVideoTag.setAttribute('autoplay', 'autoplay');
			}

			// Check if there are any sources to work with
			if(videoTagCtrl.video.hasOwnProperty('sources')){

				// Loop through sources
				for (var key in videoTagCtrl.video.sources) {

					if(videoTagCtrl.video.sources.hasOwnProperty(key)) {

						// Create a new source element and set attributes
						var source =  document.createElement('source');

						source.setAttribute('type', 'video/' + key);
						source.setAttribute('src', videoTagCtrl.video.sources[key]);

						// Put the source element inside previewVideoTag element
						previewVideoTag.appendChild(source);

					}

				} 

			}

			// Append complete video tag to modal
			$('#codePreview .modal-body').append(previewVideoTag);

			// Initialise video tag using Video.js
			videoJsInstance = videojs($('#codePreview .modal-body').find('video')[0]);


	  	});

		// When modal closes, dispose of current video
		$('#codePreview').on('hidden.bs.modal', function () {
			videoJsInstance.dispose();			
		});

		// If there is a brand querystring value, load appropriate settings from file
		var brand = $scope.getQueryStringValue("brand", location.href, false);

		if(brand !== null){
			$http.get('js/settings/' + brand + '.json')
				.success(function(data, status, headers, config){
      				console.log(data[0]);
      				videoTagCtrl.video = data[0];
		        });
		}

	}); 

	app.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/your-video', {
				templateUrl: 'partials/videos-source.html'
			})
			.when('/fullscreen-videos', {
				templateUrl: 'partials/videos-fullscreen.html'
			})
			.when('/player-skin', {
				templateUrl: 'partials/player-skins.html'
			})
			.when('/video-tag-options-and-player-skin', {
				templateUrl: 'partials/video-tag-options-and-player-skins.html'
			})
			.when('/end-screen', {
				templateUrl: 'partials/end-screen-content.html'
			})
			.when('/custom-play-replay-button', {
				templateUrl: 'partials/custom-button-play-replay.html'
			})
			.when('/videojs-components', {
				templateUrl: 'partials/videojs-components.html'
			})
			.when('/omniture-tracking', {
				templateUrl: 'partials/tracking-omniture.html'
			})
			.otherwise({
				redirectTo: '/your-video'
			});
	}]);

})();