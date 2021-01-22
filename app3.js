(function () {
'use strict';

angular.module('ShoppingListEventApp', [])
.controller('ShoppingListController', ShoppingListController)
.factory('ShoppingListFactory', ShoppingListFactory)
.service('WeightLossFilterService', WeightLossFilterService)
.component('shoppingList', {
  templateUrl: 'shoppingList3.html',
  controller: ShoppingListComponentController,
  bindings: {
    listComponent: '<',
    titleComponent: '@',
    onRemove: '&'
  }
})
.component('loadingSpinner', {
  templateUrl: 'spinner3.html',
  controller: SpinnerController
})
;


SpinnerController.$inject = ['$rootScope']
function SpinnerController($rootScope) {

  var $ctrl_temps = this;

  var Canceled = $rootScope.$on('ShoppingList : processing', function (event, data) {

    console.log("Event :", event);
    console.log("Data :", data);

    if(data.on)
    {
      $ctrl_temps.loadingSpinner = true;
    }
    else {
      $ctrl_temps.loadingSpinner = false;
    }

  });

  $ctrl_temps.$onDestroy = function () {
    Canceled();
  }


};





ShoppingListComponentController.$inject = ['$rootScope', '$element', '$q', 'WeightLossFilterService']
function ShoppingListComponentController($rootScope, $element, $q, WeightLossFilterService) {

  var $ctrl_temps = this;
  var totalItem;

  $ctrl_temps.remove = function (MyIndex) {
    $ctrl_temps.onRemove({ index_KEY : MyIndex});
  };

  $ctrl_temps.$onInit = function () {
    totalItem = 0;
  };

  $ctrl_temps.$doCheck = function () {

    if(totalItem !== $ctrl_temps.listComponent.getItems.length)
    {
      totalItem = $ctrl_temps.listComponent.getItems.length;

      $rootScope.$broadcast('ShoppingList : processing', { on: true});

    var promises = [];

    for (var i = 0; i < $ctrl_temps.listComponent.getItems.length; i++) {
      promises.push(WeightLossFilterService.CheckName($ctrl_temps.listComponent.getItems[i].name))
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
    .finally(function () {
      $rootScope.$broadcast('ShoppingList : processing', { on: false});
    });

}

  };



};



WeightLossFilterService.$inject = ['$q', '$timeout'];
function WeightLossFilterService($q, $timeout) {

  var service = this;

  service.CheckName = function (name) {

    var deferred = $q.defer();
    var result = {
      message: ""
    };

    $timeout(function () {

      if(name.toLowerCase().indexOf("cookies") === -1)
      {
        deferred.resolve(result);
      }
      else {
        result.message = "cookies is here";
        deferred.reject(result);
      }

    }, 500);

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
    ShoppingList.RemoveItem(indexItem);
    list.errorMessage = "";
    list.TitleController = Org_Title + "("+ list.getItems.length +")";
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
      throw new Error("Max items ("+ Items.length +") was reached");
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
