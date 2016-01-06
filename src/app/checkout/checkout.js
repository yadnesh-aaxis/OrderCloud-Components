angular.module('orderCloud')
	.config(checkoutConfig)
	.controller('CheckoutCtrl', CheckoutController)
	.controller('OrderReviewCtrl', OrderReviewController)
	.controller('OrderConfirmationCtrl', OrderConfirmationController)
;

function checkoutConfig($stateProvider) {
	$stateProvider
		.state('checkout', {
			parent: 'base',
            data: {componentName: 'Checkout'},
			url: '/checkout',
			templateUrl: 'checkout/templates/checkout.tpl.html',
			controller: 'CheckoutCtrl',
			controllerAs: 'checkout',
			resolve: {
                CurrentOrder: function(CurrentOrder) {
                    return CurrentOrder.Get();
                },
				LineItemsList: function($q, Underscore, Products, LineItems, CurrentOrder) {
					var dfd = $q.defer();
					LineItems.Get(CurrentOrder.ID)
						.then(function(data) {
							var productQueue =[];
							var productIDs = Underscore.uniq(Underscore.pluck(data.Items, 'ProductID'));
							angular.forEach(productIDs, function(id) {
								productQueue.push(Products.Get(id));
							});
							$q.all(productQueue)
								.then(function(results) {
									angular.forEach(data.Items, function(li) {
										li.Product = angular.copy(Underscore.where(results, {ID:li.ProductID})[0]);
									});
									dfd.resolve(data);
								})
						});
					return dfd.promise;
				},
                ShippingAddresses: function($q, Me, Underscore, ImpersonationService, CurrentOrder) {
                    return ImpersonationService.Impersonation(function() {
                        var dfd = $q.defer();
                        Me.ListAddresses()
                            .then(function(data) {
                                dfd.resolve(Underscore.where(data.Items, {Shipping:true}));
                            });
                        return dfd.promise;
                    });
                }
			}
		})
		.state('checkout.review', {
			url: '/review',
			views: {
				'@base': {
					templateUrl: 'checkout/templates/review.tpl.html',
					controller: 'OrderReviewCtrl',
					controllerAs: 'orderReview'
				}
			}
		})
		.state('checkout.confirmation', {
			url: '/confirmation',
			views: {
				'@base': {
					templateUrl: 'checkout/templates/confirmation.tpl.html',
					controller: 'OrderConfirmationCtrl',
					controllerAs: 'orderConfirmation'
				}
			}
		})
}

function CheckoutController($q, $state, CurrentOrder, LineItemsList, Addresses, LineItems, Products, Underscore, ShippingAddresses, LineItemHelpers) {
	var vm = this;
	vm.lineItems = LineItemsList;
	vm.currentOrder = CurrentOrder;
    vm.currentShipAddress = null;
    vm.shippingAddresses = ShippingAddresses;
    vm.updateLineItemShipping = UpdateShipping;
    vm.removeItem = LineItemHelpers.RemoveItem;
    vm.updateQuantity = LineItemHelpers.UpdateQuantity;
    vm.setCustomShipping = LineItemHelpers.CustomShipper;
    vm.isMultipleAddressShipping = true;

    // currently selected shipping address if all line items are going to the same place
    vm.currentOrder.ShippingAddressID = vm.lineItems.Items[0].ShippingAddressID;
    angular.forEach(vm.lineItems.Items, function(item) {
        if (vm.currentOrder.ShippingAddressID !== item.ShippingAddressID) {
            vm.currentOrder.ShippingAddressID = null;
        }
    });
    if (vm.currentOrder.ShippingAddressID) {
        vm.currentShipAddress = Underscore.where(vm.shippingAddresses, {ID: vm.currentOrder.ShippingAddressID})[0];
    }

    // paging function for line items
	vm.pagingfunction = function() {
		if (vm.lineItems.Meta.Page < vm.lineItems.Meta.TotalPages) {
			var dfd = $q.defer();
			LineItems.List(CurrentOrder.ID, vm.lineItems.Meta.Page + 1, vm.lineItems.Meta.PageSize)
				.then(function(data) {
					vm.lineItems.Meta = data.Meta;
					var productQueue = [];
					var productIDs = Underscore.uniq(Underscore.pluck(data.Items, 'ProductID'));
					angular.forEach(productIDs, function(id) {
						productQueue.push(Products.Get(id));
					});
					$q.all(productQueue)
						.then(function(results) {
							angular.forEach(data.Items, function(li) {
								li.Product = angular.copy(Underscore.where(results, {ID:li.ProductID})[0]);
							});
							vm.lineItems.Items = [].concat(vm.lineItems.Items, data.Items);
						})
				});
			return dfd.promise;
		}
		else return null;
	}

    function UpdateShipping(lineItem) {
        // Only lineItem.ShippingAddress.ID has the changed shipping address!
        Addresses.Get(lineItem.ShippingAddress.ID)
            .then(function(address) {
                LineItems.SetShippingAddress(vm.currentOrder.ID, lineItem.ID, address)
                    .then(function(address) {
                        console.log(address);
                        lineItem.ShippingAddress = address;
                    });
            });
    }

    // default state (if someone navigates to checkout -> checkout.shipping)
    $state.transitionTo('checkout.shipping');
}

function OrderReviewController() {
	var vm = this;
}

function OrderConfirmationController() {
	var vm = this;
}