/**
 * Provides a state handler that can be used on a project item to update the status information.
 *
 * It requires a .proj to be available in the scope, so either ng-init="proj = $Resource" or something
 * similar
 */
DubMark.Modules.Dub.directive("status", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      //How do I get the scope of the item hacked in?
      var dialog = null;
      $scope.isComplete = function(key){
        if($scope.proj.status[key]){
          return 'completed';
        }
      };
      $scope.changeState = function(key){
        console.log("Change status for: ", this, key);
        $scope.statusKey = key;
        $scope.text      = !this.proj.status[key] ? 'Set Done: ' + key : 'Set NOT Done: ' + key; //Updates the template

        dialog  = $('#status_change_' + $scope.proj.id).modal('show');
      };
      $scope.getStateIcon = function(key){
        return DubMark.States[key];
      };
      $scope.save = function(){
        console.log("Change status for: ", this, this.statusKey);
        if(!this.proj.status[this.statusKey]){ 
          this.proj.status[this.statusKey] = new Date();
        }else{
          this.proj.status[this.statusKey] = null;
        }
        this.proj.$save();
        dialog.modal('hide');
      };
      $scope.close = function(){
        console.log("close", this, dialog);
        dialog.modal('hide');
      }
    },
    //This seems better for using Angular vs a pure jQuery UI dialog, however it does not seem much easier to debug
    template:  
     '<div>' +
      '<div id="status_change_{{proj.id}}" tabindex="-1" class="modal hide" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-header">'+
          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
          '<h3>{{text}}</h3>'+
        '</div>'+
        '<div class="modal-footer">'+
          '<a ng-click="save()" href="#" class="btn btn-primary">Save changes</a>'+
          '<a ng-click="close()" href="#" class="btn">Close</a>'+
        '</div>'+
      '</div>'+
      '<div class="row-fluid">' +
          '<div class="span2 text-center"' + 
           ' ng-class=isComplete(key)' +
           ' ng-click=changeState(key)' +
           ' ng-repeat=\'key in ["VideoReady", "Timed", "Translated", "QA", "Completed", "Published"]\' >' +
            '<i ng-class="getStateIcon(key)" title="{{key}} {{proj.status[key]}}"/>' +
          '</div>' +
      '</div>' +
    '</div>',
    replace: true
  };
});


DubMark.Modules.Dub.directive('videomanager', function(){
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      console.log("VideoManager.", $scope, $element);

      var dialog = null;
      $scope.setVideoUrl = function(){
        console.log("Set video url.");
      };
      $scope.changeVideo = function(){
        console.log("Change video", $scope);
        dialog = $('#vid_change_' + $scope.project.id).modal('show');
      };
      $scope.save = function(){
          try{ //Tempting to move more of this logic into the vid & project itself?
            console.log("Save the video update");
            var vid = this.project.vid; //Reference to VideoView instance
            this.proj.vidUrl            = vid.vidUrl;
            this.proj.status = this.proj.status || {};
            this.proj.status.VideoReady = vid.vidUrl ? new Date() : null;
            this.proj.$save();
            $('#video').empty();

            vid.createVideo(vid.vidUrl, vid.vidType);
          }catch(e){
            console.error('Failed to update the video url.', e);
          }
        dialog.modal('hide');
      };
      $scope.close = function(){
        dialog.modal('hide');
      };
    },
    template: 
    '<div class="well span7">' +
      '<div id="video"></div>' + //Video elements are going to be added in here.
      '<div id="vid_change_{{project.id}}" tabindex="-1" ' + 
        'class="modal hide" role="dialog" aria-labelledby="myModalLabel"  aria-hidden="true">' +
         '<div class="modal-header">'+
           '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
           '<h3> Video Url </h3>' +
           '<input style="width:100%;" type="text" ng-model=project.vid.vidUrl placeholder="Video Url"/>' +
         '</div>'+
         '<div class="modal-footer">'+
           '<a ng-click="save()" href="#" class="btn btn-primary">Save changes</a>'+
           '<a ng-click="close()" href="#" class="btn">Close</a>'+
         '</div>'+
      '</div>' +
      '<button class="btn" ng-click=changeVideo()>' +
        '<i class="icon-plus" /> Change Video'  + 
      '</button>' +
    '</div>',
    replace: true
  };
});


/**
 * Sanity points.  Currently this.list required ans is the main ProjectListing instance
 */
DubMark.Modules.Dub.directive("create", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      console.log("create scope.", $scope);
      var dialog = null;

      $scope.title  = '';
      $scope.vidUrl = '';
      $scope.isEnabled = true;
      $scope.createDialog = function(){
        console.log("Open the dialog.", this);
        dialog = $('#newProject').modal('show');
      };

      $scope.validateCreated = function(doOpen, response){
        this.isEnabled = true;
          //Better to leave in the control?
        this.list.validateCreate(response);
        //Do more stuff
        if(doOpen){
          this.list.loader.open(response.id);
        }
      };

      $scope.clear = function(){
        this.title = '';
        this.vidUrl = '';
      };

      $scope.save = function(doOpen){
        console.log("Save called.", doOpen);
        this.isEnabled = false;

        this.list.loader.save(
          this.getArguments(), 
          this.validateCreated.bind(this, doOpen)
        );
        dialog.modal('hide');
      };
      $scope.createAndOpen = function(){
        this.save(true);
      };

      $scope.getArguments = function(){
        var args = {
          title: this.title,
          vidUrl: this.vidUrl,
          create_date: new Date(),
          status: this.list.getStates() //Populate with the standard states to save
        };
        if(args.vidUrl){
          args.status.VideoReady = new Date();
        }
        return args;
      };
      $scope.close = function(){
        console.log("Close");
        dialog.modal('hide');
      };
    },
    template: 
      '<div class="span1">' +
        '<div id="newProject" tabindex="-1" ' +
         'class="modal hide" role="dialog" aria-labelledby="myModalLabel"  aria-hidden="true">' +
         '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
            '<h3>New Project</h3>' +
            '<input  ng-model=title style="width:100%;" type=text placeholder="Title"/>' +
            '<input  ng-model=vidUrl style="width:100%;" type=text placeholder="Video url"/>' +
          '</div>' +
         '<div class="modal-footer">'+
           '<a ng-active=isEnabled ng-click="save()" href="#" class="btn btn-primary">Create</a>'+
           '<a ng-active=isEnabled ng-click="createAndOpen()" href="#" class="btn btn-primary">Create And Open</a>'+
           '<a ng-click="clear()" href="#" class="btn">Clear Form</a>'+
           '<a ng-click="close()" href="#" class="btn">Close</a>'+
         '</div>'+
        '</div>' +
        '<button title="Create a new project" ng-click="createDialog()"    class="btn">' +
         '<i class="icon-plus-sign"></i>' +
        '</button>' +
      '</div>',
   replace: true
  };
});


