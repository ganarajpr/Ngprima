(function () {
    var controllers = angular.module("layout");

    controllers.controller("OverlayController", [
        '$scope',
        'NodeService',
        function ($scope,NodeService) {
            $scope.options = [
                "Box",
                "Link",
                "List",
                "Text",
                "Input",
                "Button",
                "Image"
            ];
            $scope.state = {};
            $scope.state.selectedOption = "";
            $scope.$watch("state.selectedOption",function(newVal){
                if(newVal){
                    console.log($scope.state.selectedOption);
                }
            });

            $scope.onAdd = function(){
                var node = NodeService.addNode($scope.state.selectedOption);
                node.abc = "bbc";
                //node.properties.
                $scope.state.selectedOption = "";
            };
        }
    ]);
}());


