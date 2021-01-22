(function () {
'use strict';

angular.module('ShoppingListEventsApp', [])
.controller('ShoppingListController', ShoppingListController)
.factory('ShoppingListFactory', ShoppingListFactory)
.service('WeightLossFilterService', WeightLossFilterService)
.component('shoppingList', {
  templateUrl: 'shoppingList.html',
  controller: ShoppingListComponentController,
  bindings: {
    listComponent: '<',
    titleComponent: '@',
    onRemove: '&'
  }
})
.component('loadingSpinner',{
  templateUrl: 'spinner.html',
  controller: SpinnerController
})
;


SpinnerController.$inject = ['$rootScope'];
function SpinnerController($rootScope) {

  var $ctrl = this;

  var Canceled = $rootScope.$on('shoppingList: processing', function (event, data) {

    console.log("Event :", event);
    console.log("Data :", data);

    if(data.on)
    {
      $ctrl.ShowSpinner = true;
    }
    else{
      $ctrl.ShowSpinner = false;
    }

  });


  $ctrl.$onDestroy = function () {
    Canceled();
  }



};




ShoppingListComponentController.$inject = ['$rootScope','$element','$q', 'WeightLossFilterService' ]
function ShoppingListComponentController($rootScope, $element, $q, WeightLossFilterService) {

  var $ctrl_temps = this;
  var totalItem;

  // $ctrl_temps.findcookies = function () {
  //   for (var i = 0; i < $ctrl_temps.listComponent.getItems.length; i++) {
  //     var name = $ctrl_temps.listComponent.getItems[i].name;
  //     if(name.toLowerCase().indexOf("cookies") !== -1)
  //     return true;
  //   }
  //   return false;
  // };


  $ctrl_temps.remove = function (MyIndex) {
    $ctrl_temps.onRemove( { index_Key : MyIndex } );
  };



  $ctrl_temps.$onInit = function () {
    totalItem = 0;
  };

  $ctrl_temps.$doCheck = function () {

    if(totalItem !== $ctrl_temps.listComponent.getItems.length)
    {
      totalItem = $ctrl_temps.listComponent.getItems.length;

      $rootScope.$broadcast('shoppingList: processing', { on: true});

      var promises = [];
      for (var i = 0; i < $ctrl_temps.listComponent.getItems.length; i++) {
        promises.push(WeightLossFilterService.checkNames($ctrl_temps.listComponent.getItems[i].name));
      }

      for (var i = 0; i < promises.length; i++) {
        console.log("promises[i].message :",promises[i].message+":");
      }

      $q.all(promises)
      .then( function (result) {
        // remove cookies // WARNING
        var WarningMessage = $element.find('div.error');
        WarningMessage.slideUp(800);
      })
      .catch( function (result) {
        var WarningMessage = $element.find('div.error');
        WarningMessage.slideDown(800);
      })
      .finally( function () {
        $rootScope.$broadcast('shoppingList: processing', { on: false})
      });




      // if($ctrl_temps.findcookies())
      // {
      //   var WarningMessage = $element.find('div.error');
      //   WarningMessage.slideDown(800);
      // }
      // else {
      //   var WarningMessage = $element.find('div.error');
      //   WarningMessage.slideUp(800);
      // }


    }


  };



};


WeightLossFilterService.$inject = ['$q', '$timeout'];
function WeightLossFilterService($q, $timeout) {

  var service = this;

  service.checkNames = function (name) {

    var deferred = $q.defer();

    var result = {
      message: ""
    };

    $timeout(function () {

      if(name.toLowerCase().indexOf("cookies") === -1 )
      {
        deferred.resolve(result);
      }
      else {
        result.message = "cookies is detected !!!";
        deferred.reject(result);
      }

    }, 1000);

    return deferred.promise;
  };

};







ShoppingListController.$inject = ['ShoppingListFactory'];
function ShoppingListController(ShoppingListFactory) {

  var list = this;

  var ShoppingList = ShoppingListFactory();

  list.ItemName = "";
  list.ItemQuantity = "";

  list.getItems = ShoppingList.getItems();

  var Org_Title = "Shopping List 1 ";
  list.TitleController = Org_Title + "("+ list.getItems.length +")";

  list.addItem = function () {
    try {
      ShoppingList.addItem(list.ItemName, list.ItemQuantity);
      list.TitleController = Org_Title + "("+ list.getItems.length +")";
    } catch (e) {
      list.errorMessage = e.message;
    } finally {

    }
  };

  list.RemoveItem = function (indexItem) {
      console.log("this is :", this);
      this.Lastremoved = "Last item removed was :"+ list.getItems[indexItem].name;
      ShoppingList.RemoveItem(indexItem);
      list.errorMessage = "";
      this.TitleController = Org_Title + "("+ list.getItems.length +")";
  };

};





function ShoppingLis_Service(maxItems) {

  var service = this;

  var Items = [];

  service.addItem = function (itemName, itemQuantity) {
    if( ( maxItems === undefined ) ||
        ( maxItems !== undefined && Items.length < maxItems )
    )
    {
      var item = {
        name: itemName,
        quantity: itemQuantity
      };

      Items.push(item);
    }
    else {
      throw new Error("Max items ("+ Items.length +") was reached ");
    }

  };

  service.getItems = function () {
    return Items;
  };

  service.RemoveItem = function (indexItem) {
    Items.splice( indexItem , 1 );
  };

};



function ShoppingListFactory() {

  var factory = function (maxItems) {
    return new ShoppingLis_Service(maxItems);
  };
  return factory;
};


})();
