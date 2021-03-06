/**
 * Keypress handler widget, for configuration of your keyhandler.
 */
DubMark.Modules.Dub.directive("keyhandler", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: { //Finally figured out how to fix the damn scoping issues, angular++;
      keypress: '='
    },
    controller: function($scope, $element) {
      //How do I get the scope of the item hacked in?
      $scope.gT      = DubMark.i18n.gT;
      $scope.keys    = $scope.keypress.getKeyConfig();
      $scope.active  = false;

      console.log("KeyHandler?", $scope, $scope.wtf);
      $scope.save = function(){
        console.log("Save called.");
        dialog  = $('#Configuration').modal('hide');
        //Little scary
        $scope.keypress.setupCodes(
          $scope.keypress.getKeyConfig()
        );
        $scope.keypress.listen();
      };
      $scope.close = function(){
        console.log("Close called");
        dialog  = $('#Configuration').modal('hide');
        $scope.keypress.listen();
      };
      $scope.popup = function(){
        console.log("Popup");
        dialog  = $('#Configuration').modal('show');
        console.log("Dialog?");
        $scope.keypress.sleep();
      };
      $scope.clickSetting = function(set){
          console.log("click which setting?", set);
      };
      $scope.assignKey = function(key, op){
          console.log("key, op", key, op);
          //Add focus
          //Add keypress event or just hack in a window event listener
      };
      $scope.isActive = function(){
          return this.active ? "active" : '';
      };
    },
    template:
     '<div class="pull-right"> ' +
       '<div id="Configuration" tabindex="-1" class="modal hide" role="dialog" aria-labelledby="myModalLabel"  aria-hidden="true">' +
        '<div class="modal-header">' +
           '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
           '<h3>{{gT("Hotkeys")}}</h3>' +
        '</div>' +
        '<div class="modal-body">' +
            '<div class="container-fluid">' + 
              '<div id={{cfg.func}} class="row-fluid" ng-repeat="cfg in keys">' +
                '<div class="span7">{{cfg.title}}</div>' + 
                '<input type="text" class="span4" ng-model=cfg.keyString />' +
              '</div>' +
            '</div>' +
         '</div>' +
        '<div class="modal-footer">'+
          '<a ng-click=save() href="#" class="btn btn-primary">{{gT("Update")}}</a>'+
          '<a ng-click=close() href="#" class="btn">{{gT("Close")}}</a>'+
        '</div>'+
       '</div>'+
       '<div class="span2">' + 
       '<input type="button" id="hotkeys" ' + 
          'ng-click="keypress.toggle()" class="btn btn-primary" ' +
          'ng-class=keypress.isEnabled() ' +
          'title="{{gT(\'ToggleHotKeys\')}}" ' + 
          'value="{{gT(\'Hotkeys\')}} {{keypress.enabled}}"> ' +
       '</input> ' +
       '<button class="btn" ng-click=popup() title="{{gT("Configure")}}"><i class="icon-cog"></i></button>' +
       '</div>' +
     '<div>',
    replace: true
  };
});


/**
 * Provides a state handler that can be used on a project item to update the status information.
 *
 * It requires a .proj to be available in the scope, so either ng-init="proj = $Resource" or something
 * similar
 * 
 *  Note: These get pretty complex pretty fast... might want to put them in a not so "Shared" location since
 * they are still going to require access to the control modules?
 */
DubMark.Modules.Dub.directive("status", function() {
  return {
    restrict: "E",
    transclude: true,
    scope: true,
    controller: function($scope, $element) {
      //How do I get the scope of the item hacked in?
      var dialog = null;
      $scope.states = DubMark.Config.StatesOrder;

      $scope.isComplete = function(key){
        if($scope.proj.status[key]){
          return 'completed';
        }
      };
      $scope.changeState = function(key){
        try{
          console.log("status.changeState for: ", this, key);
          $scope.statusKey = key;
          $scope.text      = !this.proj.status[key] ? key + ' Done!' : key + ' NOT Done'; //Updates the template

          dialog  = $('#status_change_' + $scope.proj.id).modal('show');
        }catch(e){
          console.error("Could not change the state for this project.", this.proj);
        }
      };
      $scope.getStateIcon = function(key){
        key = key || this.statusKey;
        return DubMark.Config.States[key];
      };
      $scope.save = function(){
        console.log("status.save for: ", this, this.statusKey);
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
          '<h3>Change Status</h3>'+
        '</div>'+
        '<div class="modal-body">'+
          '<i ng-class=getStateIcon()></i> {{text}}'  +
        '</div>'+
        '<div class="modal-footer">'+
          '<a ng-click="save()" href="#" class="btn btn-primary">Save</a>'+
          '<a ng-click="close()" href="#" class="btn">Close</a>'+
        '</div>'+
      '</div>'+
      '<div class="row-fluid">' +
          '<div class="span2 text-center stateful " title="{{key}}"' + 
           ' ng-class=isComplete(key)' +
           ' ng-click=changeState(key)' +
           ' ng-repeat=\'key in states\' >' +
            '<i ng-class="getStateIcon(key)" {{proj.status[key]}}"/>' +
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

        setTimeout(function(){
          this.action.keypressOff()
        }.bind(this), 100);
      };
      $scope.save = function(){
          try{ //Tempting to move more of this logic into the vid & project itself?
            console.log("Save the video update");
            var vid = this.project.vid; //Reference to VideoView instance
            this.proj.vidUrl            = vid.vidUrl;
            this.proj.status = this.proj.status || {};
            this.proj.status.VideoReady = vid.vidUrl ? new Date() : null;
            this.proj.$save();

            vid.reset();
            /*
            $('#video').empty();
            vid.createVideo(vid.vidUrl, vid.vidType);
            */
          }catch(e){
            console.error('Failed to update the video url.', e);
          }
        dialog.modal('hide');
      };
      $scope.reset = function(){
          this.project.vid.reset();
      },
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
         '</div>'+
         '<div class="modal-body">'+
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
      '<button class="btn" ng-click=reset()>' +
        '<i class="icon-refresh" /> Reset Subs'  + 
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
          this.list.ResourceProject.open(response.id);
        }
      };

      $scope.clear = function(){
        this.title = '';
        this.vidUrl = '';
      };

      $scope.save = function(doOpen){
        this.isEnabled = false;
        this.list.ResourceProject.save(
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
         '</div>' +
         '<div class="modal-body">' +
            '<input  ng-model=title style="width:100%;" type=text placeholder="Title"/>' +
            '<input  ng-model=vidUrl style="width:100%;" type=text placeholder="Video url"/>' +
          '</div>' +
         '<div class="modal-footer">'+
           '<a ng-hide=!isEnabled ng-click="save()" href="#" class="btn btn-primary">Create</a>'+
           '<a ng-hide=!isEnabled ng-click="createAndOpen()" href="#" class="btn btn-primary">Create And Open</a>'+
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

/**
 *  TODO: Remove / deprecate once this is in the core angular impl
 */
DubMark.Modules.Dub.directive('ngFocus', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngFocus']);
    element.bind('focus', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  }
}]);
 
DubMark.Modules.Dub.directive('ngBlur', ['$parse', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['ngBlur']);
    element.bind('blur', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  }
}]);
