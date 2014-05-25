(function () {
    angular.module("layout")
        .controller("OverlayController", [
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
            nutan.$watch("state.selectedOption",function(newVal){
                if(newVal){
                    console.log($scope.state.selectedOption);
                }
            });
            log();

            $scope.log();
            tre.abc.log().log();
            $scope.onAdd = function(){
                var node = NodeService.addNode($scope.state.selectedOption);
                node.abc = "bbc";
                console.log(node.abc);
                //node.properties.
                $scope.state.selectedOption = "";
            };

        }
    ]);
    angular.module("layout");
    $scope.controller();


}());


