(function () {
'use strict';

angular.module('ShoppingListEventApp', [])
.controller('ShoppingListController', ShoppingListController)
.factory('ShoppingListFactory', ShoppingListFactory)
.service('WeightLossFilterService', WeightLossFilterService)
.component('shoppingList', {
  templateUrl: 'shoppingList1.html',
  controller: ShoppingListComponentController,
  bindings: {
    listComponent: '<',
    titleComponent: '@',
    onRemove: '&'
  }

})
.component('loadingSpinner', {
  templateUrl: 'spinner1.html',
  controller: spinnerController
})
;


spinnerController.$inject = ['$rootScope']
function spinnerController($rootScope) {

  var $ctrl_temps = this;

  var Canceled = $rootScope.$on('shoppingList: processing', function (event, data) {

    console.log("Event: ", event);
    console.log("Data: ", data);

    if(data.on)
    {
      $ctrl_temps.showSpinner = true;
    }
    else {
      $ctrl_temps.showSpinner = false;
    }


  });

  $ctrl_temps.$onDestroy = function () {
    Canceled();
  }

};




ShoppingListComponentController.$inject = ['$rootScope', '$element', '$q', 'WeightLossFilterService']
function ShoppingListComponentController($rootScope, $element, $q, WeightLossFilterService) {

  var $ctrl_temps = this;
  var TotalItems;

  // $ctrl_temps.findcookies = function () {
  //
  //   for (var i = 0; i < $ctrl_temps.listComponent.getItems.length; i++) {
  //     var name = $ctrl_temps.listComponent.getItems[i].name;
  //     if(name.toLowerCase().indexOf("cookies") !== -1)
  //     return true;
  //   }
  //   return false;
  // };


  $ctrl_temps.remove = function (MyIndex) {
    $ctrl_temps.onRemove({ index_Key : MyIndex});
  };


  $ctrl_temps.$onInit = function () {
    TotalItems = 0;
  }

  $ctrl_temps.$doCheck = function () {

    if(TotalItems !== $ctrl_temps.listComponent.getItems.length)
    {
      TotalItems = $ctrl_temps.listComponent.getItems.length;


      $rootScope.$broadcast('shoppingList: processing', { on: true});

      var promises = [];

      for (var i = 0; i < $ctrl_temps.listComponent.getItems.length; i++) {
        promises.push(WeightLossFilterService.CheckName($ctrl_temps.listComponent.getItems[i].name));
      }

      $q.all(promises)
      .then(function (result) {
        var WarningMessage = $element.find('div.error');
        WarningMessage.slideUp(500);
      })
      .catch(function (result) {
        var WarningMessage = $element.find('div.error');
        WarningMessage.slideDown(500);
      })
      .finally(function (result) {
        $rootScope.$broadcast('shoppingList: processing', { on: false});
      });
    }

  };




};



WeightLossFilterService.$inject = ['$q', '$timeout'];
function WeightLossFilterService($q, $timeout) {

  var service= this;

  service.CheckName = function (name) {

    var deferred = $q.defer();

    $timeout(function () {

      var result = {
        message: ""
      };


      if(name.toLowerCase().indexOf("cookies") === -1)
      {
      deferred.resolve(result);
      }
      else {
        result.message = "cookies there !!!";
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
    this.Lastremoved = "Last item removed was :"+list.getItems[indexItem].name;
    ShoppingList.RemoveItem(indexItem);
    list.errorMessage = "";
    this.TitleController = Org_Title + "("+ list.getItems.length +")";
  };


};






function ShoppingList_Service(maxItems) {

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
      throw new wError("Max item ("+ Items.length +") was reached");
    }

  };

  service.getItems = function () {
    return Items;
  };

  service.RemoveItem = function (indexItem) {
    Items.splice( indexItem, 1 );
  };

};



function ShoppingListFactory() {

  var factory = function (maxItems) {
    return new ShoppingList_Service(maxItems);
  };
  return factory;
};




})();
