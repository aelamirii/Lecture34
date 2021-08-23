(function () {
'use strict';

angular.module('ShoppingListApp', [])
.controller('ShoppingListController', ShoppingListController)
.factory('ShoppingListFactory', ShoppingListFactory)
.service('WeightLossFilterService', WeightLossFilterService)
.component('shippingListComponent', {
  templateUrl: 'shoppingList7.html',
  controller: ShoppingListComponentController,
  bindings: {
  listComponent: '<',
  titleComponent: '@',
  onRemove: '&'
}
})
.component('loadingSpinner', {
  templateUrl: 'spinner7.html',
  controller: SpinnerController
})
;


SpinnerController.$inject = ['$rootScope'];
function SpinnerController($rootScope) {

  var $ctrl = this;

    var cancelled = $rootScope.$on('ShoppingList : processing', function (event , data) {

      console.log("Event: ", event);
      console.log("Data: ", data);

      if(data.on == true)
      {
        $ctrl.loadingSpinner = true;
      }
      else if(data.on == false)
      {
        $ctrl.loadingSpinner = false;
      }

    });

    $ctrl.$onDestroy = function () {
      cancelled();
    }




}




ShoppingListComponentController.$inject = ['$rootScope', '$element', '$q' , 'WeightLossFilterService'];
function ShoppingListComponentController($rootScope, $element, $q,  WeightLossFilterService) {

  var $ctrl = this;

  var Total_Items ;

  $ctrl.$on = function () {
    Total_Items = 0;
  };

  $ctrl.$onChanges = function () {

  };

  $ctrl.$doCheck = function () {

    if(Total_Items !== $ctrl.listComponent.getItems.length)
    {

      Total_Items = $ctrl.listComponent.getItems.length;

      $rootScope.$broadcast('ShoppingList : processing', {on : true});


      var Promisses = [];

      for(var i=0; i < $ctrl.listComponent.getItems.length; i++ )
      {
        Promisses.push(WeightLossFilterService.CheckName($ctrl.listComponent.getItems[i].name));
      }

      $q.all(Promisses)
      .then(function (result) {
        var WarningMessage = $element.find("div.error");
        WarningMessage.slideUp(300);
      })
      .catch(function (result) {
        var WarningMessage = $element.find("div.error");
        WarningMessage.slideDown(300);
      })
      .finally(function () {
        $rootScope.$broadcast('ShoppingList : processing', {on : false});
      });



    }

  }





}




ShoppingListController.$inject = ['ShoppingListFactory'];
function ShoppingListController(ShoppingListFactory) {

  var list = this;

  var ShoppingList = ShoppingListFactory(3);

  list.ItemName = "";
  list.ItemQuantity = "";

  list.getItems = ShoppingList.getItems();

  var Org_Title = "Shopping List count ";
  list.Title_Controller = Org_Title + " ( " + list.getItems.length + " )";

  list.addItem = function () {

    try {
      ShoppingList.addItem(list.ItemName, list.ItemQuantity);
      list.Title_Controller = Org_Title + " ( " + list.getItems.length + " )";
    } catch (e) {
      list.errorMessage = e.message;
    } finally {

    }

  };


  list.RemoveItem = function (indexItem) {
    ShoppingList.RemoveItem(indexItem);
    list.Title_Controller = Org_Title + " ( " + list.getItems.length + " )";
  };


}



WeightLossFilterService.$inject = ['$q', '$timeout'];
function WeightLossFilterService($q, $timeout) {

  var service = this;

  service.CheckName = function (Name) {

    var deferred = $q.defer();

    $timeout(function () {
      var result = {
        message: ""
      };

      if(Name.toLowerCase().indexOf("cookies") === -1)
      {
        deferred.resolve(result);
      }
      else {
        result.message = "Cookies detecteddddddd";
        deferred.reject(result);
      }
    }, 1000);


    return deferred.promise;

  };


}





function ShoppingList_Service(maxItems) {

  var service = this;
  var Items = [];

  service.addItem = function (Name, Quantity) {

    if( (maxItems === undefined )
     || ( maxItems !== undefined && Items.length < maxItems)
      )
      {
        var item = {
          name: Name,
          quantity: Quantity
        };

        Items.push(item);
      }
      else {
        throw new Error("Max items ("+maxItems +") was reached ");
      }

  };

  service.getItems = function () {
    return Items;
  };

  service.RemoveItem = function (index) {
    Items.splice( index, 1);
  };

};



function ShoppingListFactory() {

  var factory = function (maxItems) {
    return new ShoppingList_Service(maxItems)
  }

  return factory;
};





})();
