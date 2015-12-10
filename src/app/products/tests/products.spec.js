describe('Component: Products', function() {
    var scope,
        q,
        product;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        product = {
            ID: "TestProduct123456789",
            Name: "TestProductTest",
            Description: "Test Product Description",
            QuantityMultiplier: 1,
            ShipWeight: 1,
            Active: true,
            Type: "Static",
            InventoryEnabled: false,
            InventoryNotificationPoint: null,
            VariantLevelInventory: false,
            AllowOrderExceedInventory: false,
            DisplayInventory: false
        };
    }));

    describe('State: Base.products', function() {
        var state;
        beforeEach(inject(function($state, Products) {
            state = $state.get('base.products');
            spyOn(Products, 'List').and.returnValue(null);
        }));
        it('should resolve ProductList', inject(function ($injector, Products) {
            $injector.invoke(state.resolve.ProductList);
            expect(Products.List).toHaveBeenCalled();
        }));
    });

    describe('State: Base.productEdit', function() {
        var state;
        beforeEach(inject(function($state, Products) {
            state = $state.get('base.productEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(Products, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedProduct', inject(function ($injector, $stateParams, Products) {
            $injector.invoke(state.resolve.SelectedProduct);
            expect(Products.Get).toHaveBeenCalledWith($stateParams.productid);
        }));
    });

    describe('State: Base.productAssignments', function() {
        var state;
        beforeEach(inject(function($state, Products) {
            state = $state.get('base.productAssignments');
            spyOn(Products, 'ListAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(Products, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve Assignments', inject(function ($injector, $stateParams, Products) {
            $injector.invoke(state.resolve.Assignments);
            expect(Products.ListAssignments).toHaveBeenCalledWith($stateParams.productid);
        }));
        it('should resolve SelectedProduct', inject(function ($injector, $stateParams, Products) {
            $injector.invoke(state.resolve.SelectedProduct);
            expect(Products.Get).toHaveBeenCalledWith($stateParams.productid);
        }));
    });

    describe('State: Base.productCreateAssignment', function() {
        var state;
        beforeEach(inject(function($state, UserGroups, PriceSchedules) {
            state = $state.get('base.productCreateAssignment');
            spyOn(UserGroups, 'List').and.returnValue(null);
            spyOn(PriceSchedules, 'List').and.returnValue(null);
        }));
        it('should resolve UserGroupList', inject(function ($injector, UserGroups) {
            $injector.invoke(state.resolve.UserGroupList);
            expect(UserGroups.List).toHaveBeenCalled();
        }));
        it('should resolve PriceScheduleList', inject(function ($injector, PriceSchedules) {
            $injector.invoke(state.resolve.PriceScheduleList);
            expect(PriceSchedules.List).toHaveBeenCalled();
        }));
    });

    describe('Controller: ProductEditCtrl', function() {
        var productEditCtrl;
        beforeEach(inject(function($state, $controller, Products) {
            productEditCtrl = $controller('ProductEditCtrl', {
                $scope: scope,
                Products: Products,
                SelectedProduct: product
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Products) {
                productEditCtrl.product = product;
                productEditCtrl.productID = "TestProduct123456789";
                var defer = q.defer();
                defer.resolve(product);
                spyOn(Products, 'Update').and.returnValue(defer.promise);
                productEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Products Update method', inject(function(Products) {
                expect(Products.Update).toHaveBeenCalledWith(productEditCtrl.productID, productEditCtrl.product);
            }));
            it ('should enter the products state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.products');
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(Products) {
                var defer = q.defer();
                defer.resolve(product);
                spyOn(Products, 'Delete').and.returnValue(defer.promise);
                productEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the Products Delete method', inject(function(Products) {
                expect(Products.Delete).toHaveBeenCalledWith(product.ID);
            }));
            it ('should enter the products state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.products');
            }));
        });
    });

    describe('Controller: ProductCreateCtrl', function() {
        var productCreateCtrl;
        beforeEach(inject(function($state, $controller, Products) {
            productCreateCtrl = $controller('ProductCreateCtrl', {
                $scope: scope,
                Products: Products
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Products) {
                productCreateCtrl.product = product;
                var defer = q.defer();
                defer.resolve(product);
                spyOn(Products, 'Create').and.returnValue(defer.promise);
                productCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Products Create method', inject(function(Products) {
                expect(Products.Create).toHaveBeenCalledWith(product);
            }));
            it ('should enter the products state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.products');
            }));
        });
    });

    describe('Controller: ProductAssignmentsCtrl', function() {
        var productAssignmentsCtrl;
        beforeEach(inject(function($state, $controller, Products) {
            productAssignmentsCtrl = $controller('ProductAssignmentsCtrl', {
                $scope: scope,
                Products: Products,
                SelectedProduct: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Delete', function() {
            beforeEach(inject(function(Products) {
                scope.assignment = {
                    UserGroupID: '42'
                };
                var defer = q.defer();
                defer.resolve();
                spyOn(Products, 'DeleteAssignment').and.returnValue(defer.promise);
                productAssignmentsCtrl.Delete(scope);
            }));
            it ('should call the Product DeleteAssignment method', inject(function(Products, $stateParams) {
                expect(Products.DeleteAssignment).toHaveBeenCalledWith($stateParams.productid, null, scope.assignment.UserGroupID);
            }));
        });
    });

    describe('Controller: ProductCreateAssignmentCtrl', function() {
        var productCreateAssignmentCtrl;
        beforeEach(inject(function($state, $controller, Products) {
            productCreateAssignmentCtrl = $controller('ProductCreateAssignmentCtrl', {
                $scope: scope,
                Products: Products,
                UserGroupList: [],
                PriceScheduleList: []
        });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('toggleReplenishmentPS', function() {
            beforeEach(inject(function() {
            productCreateAssignmentCtrl.model= {
                ReplenishmentPriceScheduleID: "TestPriceSchedule123456789"
            };
                productCreateAssignmentCtrl.toggleReplenishmentPS(productCreateAssignmentCtrl.model.ReplenishmentPriceScheduleID);

            }));
            it ('should call toggleReplenishmentPS method', function() {
                expect(productCreateAssignmentCtrl.model.ReplenishmentPriceScheduleID).toBe(null);
            });
        });

        describe('toggleStandardPS', function() {
            beforeEach(inject(function() {
                var id = "TestPriceSchedule123456789";
                productCreateAssignmentCtrl.model= {
                   StandardPriceScheduleID: null
                };
                productCreateAssignmentCtrl.toggleStandardPS(id);

            }));
            it ('should call toggleReplenishmentPS method', function() {
                expect(productCreateAssignmentCtrl.model.StandardPriceScheduleID).toBe("TestPriceSchedule123456789");
            });
        });

        describe('submit', function() {
            beforeEach(inject(function(Products) {
                var defer = q.defer();
                defer.resolve();
                spyOn(Products, 'SaveAssignment').and.returnValue(defer.promise);
                productCreateAssignmentCtrl.model= {
                    ProductID: "TestProduct123456789",
                    BuyerID: "TestBuyer123456789",
                    UserGroupID: "TestUserGroup123456789",
                    StandardPriceScheduleID: "TestPriceSchedule123456789"
                };
                productCreateAssignmentCtrl.assignBuyer = true;
                productCreateAssignmentCtrl.submit();
            }));

            it ('should call the Product SaveAssignment method', inject(function(Products) {
                expect(Products.SaveAssignment).toHaveBeenCalledWith(productCreateAssignmentCtrl.model);
            }));
        });
    });
});

