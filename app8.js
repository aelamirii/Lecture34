(function () {
'use strict';

angular.module('ShoppingListApp',[])
.controller('ShoppingListController', ShoppingListController)
.factory('ShoppingListFactory', ShoppingListFactory)
.service('WeightLossFilterService', WeightLossFilterService)
.component('shoppingListComponent', {
  templateUrl: 'shoppingList8.html',
  controller: ShoppingListComponentController,
  bindings: {
    listItems: '<',
    titleItems: '@',
    onRemove: '&'
  }
})
.component('loadingSpinner', {
  templateUrl: 'spinner8.html',
  controller: SpinnerController
})
;



SpinnerController.$inject = ['$rootScope'];
function SpinnerController($rootScope) {

  var $ctrl = this;

  $rootScope.$on('ShoppingList : Processing', function (event, data) {

    console.log("Event :", event);
    console.log("Data :", data);

    if(data.on)
    {
      $ctrl.loadingSpinner = true;
    }
    else {
      $ctrl.loadingSpinner = false;
    }

  })



}




ShoppingListComponentController.$inject = ['$rootScope', '$element', '$q', 'WeightLossFilterService'];
function ShoppingListComponentController($rootScope, $element, $q, WeightLossFilterService) {

  var $ctrl = this;

  var Total_Items ;

  $ctrl.$on = function () {
    Total_Items = 0;
  }

  $ctrl.$onChanges = function () {

  };


  $ctrl.$doCheck = function () {

    if(Total_Items !== $ctrl.listItems.getItems.length)
    {
      Total_Items = $ctrl.listItems.getItems.length;

      $rootScope.$broadcast('ShoppingList : Processing', { on : true });


      var promises = [];

      for (var i = 0; i < $ctrl.listItems.getItems.length; i++) {
        promises.push(WeightLossFilterService.CheckName($ctrl.listItems.getItems[i].name));
      }


      $q.all(promises)
      .then(function (result) {
        var WarninMessage = $element.find('div.error');
        WarninMessage.slideUp(300);
      })
      .catch(function (result) {
        var WarninMessage = $element.find('div.error');
        WarninMessage.slideDown(300);
      })
      .finally(function (result) {
        $rootScope.$broadcast('ShoppingList : Processing', { on : false });
      });



    }



  };



}




ShoppingListController.$inject = ['ShoppingListFactory'];
function ShoppingListController(ShoppingListFactory) {

  var list = this;

  var ShoppingList = ShoppingListFactory(3);

  list.ItemName = "";
  list.ItemQuantity = "";

  list.getItems = ShoppingList.getItems();

  var Org_Title = "Shopping List count ";
  list.Title_Controller = Org_Title + "("+ list.getItems.length +")";

  list.addItem = function () {

    try {
      ShoppingList.addItem( list.ItemName, list.ItemQuantity);
      list.Title_Controller = Org_Title + "("+ list.getItems.length +")";
    } catch (e) {
      list.errorMessage = e.message;
    } finally {

    }

  };

  list.RemoveItem = function (indexItem) {
    ShoppingList.RemoveItem(indexItem);
    list.Title_Controller = Org_Title + "("+ list.getItems.length +")";
  }

}



WeightLossFilterService.$inject = ['$q', '$timeout']
function WeightLossFilterService($q, $timeout) {

  var service = this;

  service.CheckName = function (Name) {

    var deferred = $q.defer();

    var result = {
      message : ""
    };


    $timeout(function () {

      if(Name.toLowerCase().indexOf("cookies") === -1)
      deferred.resolve(result);
      else {
        result.message = "Cookies here";
        deferred.reject(result);
      }


    }, 1000);

    return deferred.promise;

  };

}






function ShoppingList_Service(maxItems) {

  var service = this;

  var Items = [];


  service.addItem = function (itemName, itemQuantity) {

    if( maxItems === undefined ||
      ( maxItems !== undefined && Items.length < maxItems  ))
      {
        var item = {
          name: itemName,
          quantity: itemQuantity
        };

          Items.push(item);
      }
      else {
        throw new Error("Max items ("+ maxItems +") was reached ");
      }
  };

  service.getItems = function () {
    return Items;
  };

  service.RemoveItem = function (indexItem) {
    Items.splice(indexItem , 1 );
  };

}



function ShoppingListFactory() {

  var factory = function (maxItems) {
    return new ShoppingList_Service(maxItems);
  };
  return factory;
}




})();
