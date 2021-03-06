/* Note the module name is the same as ng-app="dub"
 *
 *  This is a mock object test so that gh-pages will all work without actual mongo or rails support.
 *
 *  TODO:  Events still a little buggy, need to actually get a MockResource of angular to trigger all
 *  the right things.
*/
var dub = angular.module('dub', ['ngResource']);

DubMark.MockResource = function(args){ //No resource mock?
  this.init(args);
};
$.extend(DubMark.MockResource.prototype, {
  sequence: {id: 0},
  $get: function(func){
    typeof func == 'function' ? func() : null;
    return this;
  },
  init: function(args){
    this.id = this.sequence.id++; 
    this.status = this.getStates();

    if(args){
      $.each(args, function(k, v){
        this.set(k, v);
      }.bind(this));
    }
  },
  getStates: function(){
    var newStates = {};
    for (key in DubMark.Config.States){
      if(typeof key == 'string'){
        newStates[key] = null;
      }
    }
    newStates.New = new Date();
    return newStates;
  },
  $save: function(args, func){
    typeof func == 'function' ? func(args) : null;
    console.log("$save", args, this);
    $.each(args || {}, function(key, val){
      this[key] = val;
    });
    this.id = this.sequence.id++; 
  
    return this;
  },
  $query: function(func){
    return [{}];
  },
  $remove: function(func){
    delete this;
  },
  get: function(args){
    return {};
  },
  query: function() { return [{title: 'Mock', id: 'mock'}] },
  save: function(args, cb) {
    console.log("save: ", args, cb);
    this.id = this.sequence.id++; 
    args.id = this.id;
    if(typeof cb == 'function'){
      args.title = args.title + ' MOCK';
      cb(args);
    }
    console.log(this, args);
    return args;
  },
  open: function(id){
    window.open('edit.html?id=' + id);
  },
  remove: function(args, func){
    typeof func == 'function' ? func(args) : null;
    delete this;
  },
  set: function(key, val){
    return this[key] = val;
  },
  get: function(){
    return this[key];
  },
});


//TODO: I am still a little confused by why there isn't a MockResource object (need to trigger apply stuff)
DubMark.MockProjectResource = function(args){
  this.init(args);
};
$.extend(DubMark.MockProjectResource.prototype, DubMark.MockResource.prototype);
dub.factory('Project', function(){
  var project = DubMark.MockProjectResource;
  return project;
});

//Mock the subtitle resource, this one could use some better default data
DubMark.MockSubsResource = function(){
  this.init();
};
$.extend(DubMark.MockSubsResource.prototype, DubMark.MockResource.prototype);
dub.factory('Subtitles', function(){
  var rez = DubMark.MockSubsResource;
  console.log("Subs?", rez, new rez());
  return rez;
});

//Mock the stylin creation (init with the DubMark.Config.Stylin default?"
DubMark.MockStylinResource = function(args){
  this.init(args);
};
$.extend(DubMark.MockStylinResource.prototype, DubMark.MockResource.prototype);
dub.factory('Stylin', function(){ //Populate with more than just default?
  var rez = DubMark.MockStylinResource;
  console.log("Stylin?", rez, new rez());
  return rez;
});


//For the index.html page
dub.controller('ProjectListings', function($scope, $resource, Project){
  var args = DubMark.Config.PageConfig || {};

  if(args.data){
    var arr = [];
    var data = args.data;
    for(var i=0; i< data.length; ++i){
      console.log("What is the proejct?", data[i]);
      var datum = data[i];
          datum.id = i;
      arr.push(new Project(datum));
    }
    args.data = arr; //Merge this data into actual objects with a title
  }

  console.log("What is in resource project?", args, Project);
  var list = new DubMark.ProjectList(args);
      list.ResourceProject = new Project(); //For creating new instances (hacky mock)
      list.$scope = $scope;

  //Hmmm.. better way to do this loading?
  $scope.gT = window.gT;
  $scope.list = list;
  //list.load();
});

//This is used on the edit page
//PageConfig comes from the serialization of the actual json data we already have in the page
dub.controller('ProjectEntry', DubMark.ProjectEntry = function($scope, Project, Subtitles, Stylin){
  var args = {
    id: 1,
    title: 'A Mock Project',
    vidUrl: 'Sample.webm'
  };

  //Initialize with the json from the rails call, single instance vs a lib reference
  args.ResourceProject   = new Project(args);  //$resource single instance to update vs ability to query
  args.ResourceSubtitles = new Subtitles();          //$resource subtitle endpoint
  args.$scope =            $scope; //Newb learning


  //Hmmm.. better way to do this loading?
  $scope.gT = window.gT;

  //Point various bits of scope at each other
  $scope.project  = new DubMark.Project(args);
  $scope.action   = new DubMark.Actions($scope.project);
  $scope.keypress = new DubMark.KeyPress($scope.action);
  $scope.stylin   = new DubMark.StylinManager({ResourceStylin: Stylin});


  $scope.Lang     = DubMark.i18n.getInstance(); //TODO, needs to set stuff... Bleah
  $scope.i18n     = DubMark.i18n.Lang; //Shorthand for in the app using angular bindings

  $scope.proj     = args.ResourceProject;
  $scope.project.load();

});

DubMark.Modules.Dub = dub;
