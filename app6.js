(function () {
  'use strict';

angular.module('ShoppingListEventApp', [])
.controller('ShoppingListController', ShoppingListController)
.factory('ShoppingListFactory', ShoppingListFactory)
.service('WeightLossFilterService',WeightLossFilterService)
.component('shoppingList',{
  templateUrl: 'shoppingList6.html',
   controller: ShoppingListComponentController,
  bindings: {
    listComponent : '<',
    titleComponent: '@',
    onRemove: '&'
  }
}
)
.component('loadingSpinner', {
  templateUrl: 'Spinner6.html',
  controller: SpinnerController
})
;


SpinnerController.$inject = ['$rootScope'];
function SpinnerController($rootScope) {

  var $ctrl_temps = this;

  var canceled = $rootScope.$on('ShoppingList : processing', function (event, data) {

    console.log("Event :", event);
    console.log("Data :", data);

    if(data.on)
    {
      $ctrl_temps.loadingSpinner = true;
    }
    else if(data.on === false)
    {
      $ctrl_temps.loadingSpinner = false;
    }

  });

  $ctrl_temps.$onDestroy = function () {
    canceled();
  }


};


ShoppingListComponentController.$inject = ['$rootScope','$element', '$q', 'WeightLossFilterService']
function ShoppingListComponentController($rootScope, $element, $q , WeightLossFilterService) {

  var $ctrl_temps = this;

  var TotalItem ;

  // $ctrl_temps.findCookies = function () {
  //
  //   console.log("Nbr : compt :",  $ctrl_temps.listComponent.getItems.length);
  //   for(var i=0; i < $ctrl_temps.listComponent.getItems.length; i++)
  //   {
  //     var name = $ctrl_temps.listComponent.getItems[i].name;
  //     if(name.toLowerCase().indexOf("cookies") !== -1)
  //       return true;
  //   }
  //
  //   return false;
  //
  // };


  $ctrl_temps.remove = function ( index ) {
  $ctrl_temps.onRemove( {index_Key : index} );

};

  $ctrl_temps.$onInit = function () {
    TotalItem = 0;
  };


  $ctrl_temps.onChanges = function () {
  };

  $ctrl_temps.$doCheck = function () {

    console.log("$ctrl_temps.listComponent.getItems.length", $ctrl_temps.listComponent.getItems.length);
    console.log("TotalItem ...", TotalItem);
    if(TotalItem !== $ctrl_temps.listComponent.getItems.length)
    {
      TotalItem = $ctrl_temps.listComponent.getItems.length;
      console.log("TotalItem :", TotalItem);

      $rootScope.$broadcast('ShoppingList : processing' , { on : true } );



    var promises = [];

    for(var i=0; i < $ctrl_temps.listComponent.getItems.length; i++)
        promises.push(WeightLossFilterService.CheckName($ctrl_temps.listComponent.getItems[i].name));

        console.log("promises.length :", promises.length);

  $q.all(promises)
  .then(function (result) {
    var WarningElelement = $element.find('div.error');
    WarningElelement.slideUp(300);
  })
  .catch(function (result) {
    var WarningElelement = $element.find('div.error');
    WarningElelement.slideDown(300);
  })
  .finally(function () {
    $rootScope.$broadcast('ShoppingList : processing' , { on : false } );
  });


}
    };



  // $ctrl_temps.$postLink = function () {
  //
  //   console.log("$ctrl_temps.findcookies() ",$ctrl_temps.findCookies());
  //   $scope.$watch('$ctrl.findCookies()', function (newValue, oldValue) {
  //
  //     console.log("Old Value :", oldValue);
  //     console.log("New Value :", newValue);
  //
  //     if(newValue == true)
  //     {
  //       var WarningMessage = $element.find('div.error')
  //       WarningMessage.slideDown(300);
  //
  //     }
  //
  //     else if(newValue == false)
  //     {
  //       var WarningMessage = $element.find('div.error')
  //       WarningMessage.slideUp(300);
  //
  //     }
  //
  //   })
  //
  // }



}




ShoppingListController.$inject = ['ShoppingListFactory']
function ShoppingListController(ShoppingListFactory) {

  var list = this;

  var ShoppingList = ShoppingListFactory(3);

  list.ItemName = "";
  list.ItemQuantity = "";


  list.getItems = ShoppingList.getItems();

  list.titleController = "Shopping List count ("+list.getItems.length+") ";


  list.addItem = function () {

    try {
      ShoppingList.addItems(list.ItemName , list.ItemQuantity );
      list.titleController = "Shopping List count. ("+list.getItems.length+") ";
    } catch (e) {
      list.errorMessage = e.message;
    } finally {

    }

  };


  list.RemoveItem = function (indexItem) {
    ShoppingList.RemoveItem(indexItem);
    list.errorMessage = "";
    list.titleController = "Shopping List count ("+list.getItems.length+") ";
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
        result.message = "cookies here";
        deferred.reject(result);
      }


    }, 500);

    return deferred.promise;
  };


};





function ShoppingList_Service(maxItems) {

  var service = this;

  var Items = [];

  service.addItems = function (itemName, itemQuantity) {

    if( maxItems === undefined ||
      ( maxItems !== undefined && Items.length < maxItems  )
    )
    {
      console.log("Items.lenght Before : ", Items.length);
      var item = {
        name: itemName,
        quantity: itemQuantity
      };

      Items.push(item);
    }
    else {
      throw new Error("Max items ("+maxItems + ") was reached");
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

  var factory =function (maxItems) {
    return new ShoppingList_Service(maxItems);
  };
  return factory;
};




})();
