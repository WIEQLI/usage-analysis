angular.module('ptAnywhere.dashboard')
    .directive('barChart', [function() {
        function createChart(ctx, data) {
            return new Chart(ctx, {type: 'bar', data: data, options: {barPercentage: 1.0}});
        }

        return {
            restrict: 'C',
            template: '<div ng-if="chartData === null">Loading...</div>'+
                       '<canvas style="width: 100%; height: 400px;"></canvas>',
            scope: {
                chartData: '='
            },
            link: function($scope, $element, $attrs) {
                $scope.chart = null;
                $scope.$watch('chartData', function(newValue, oldValue) {
                    if (newValue!==null) {
                        var ctx = $element.find('canvas')[0].getContext('2d');
                        if ($scope.chart === null) {
                            $scope.chart = createChart(ctx, $scope.chartData);
                        } else {
                            $scope.chart.destroy();
                            $scope.chart = createChart(ctx, $scope.chartData);
                            /*chart.data = newValue;
                            chart.update();*/
                        }
                    }
                });
            }
        };
    }])
    .directive('scatterplot', [function() {
        function createChart(element, data, options) {
            var container = element.find('.scatter')[0];
            var dataset = new vis.DataSet(data);
            return new vis.Graph2d(container, dataset, options);
        }

        return {
            restrict: 'C',
            template: '<div ng-if="chartData === null">Loading...</div><div class="scatter"></div>',
            scope: {
                chartData: '=',
                chartOptions: '='
            },
            link: function($scope, $element, $attrs) {
                $scope.chart = null;
                $scope.$watch('chartData', function(newValue, oldValue) {
                    if (newValue!==null) {
                        if ($scope.chart === null) {
                            $scope.chart = createChart($element, newValue, $scope.chartOptions);
                        } else {
                            $scope.chart.destroy();  // Not so elegant
                            $scope.chart = createChart(container, newValue, $scope.chartOptions);
                        }
                    }
                });
            }
        };
    }])
    .directive('slider', [function() {
        var container;

        function createSlider(element, onSlide, onStop) {
            container = $(element.find('div')[0]);
            container.slider({range: "min", slide: onSlide, stop: onStop});
        }

        function getValue() {
            return container.slider('value');
        }

        function updateLimits(newMax, $scope) {
            // The order is importante: if min changes and the slider is there, it will get the new value
            var oldSliderVal = getValue();
            container.slider('option', 'min', (newMax === 0)? 0: 1);
            container.slider('option', 'max', newMax);

            if (oldSliderVal === 0 || newMax < oldSliderVal) {
                container.slider('value', (newMax>=3)? 3: newMax);
                // Trigger the event (not done automatically when we change the value programmatically)
                $scope.onChange({value: getValue()});
            }
        }

        return {
            restrict: 'C',
            template: '<div></div>',
            scope: {
                onSlide: '&',
                onChange: '&',
                sliderMax: '='
            },
            link: function($scope, $element, $attrs) {
                createSlider($element, function(event, ui) {
                    $scope.onSlide({value: ui.value});
                },
                function(event, ui) {
                    $scope.onChange({value: ui.value});
                });
                updateLimits($scope.sliderMax, $scope);

                $scope.$watch('sliderMax', function(newMax, oldMax) {
                    updateLimits(newMax, $scope);
                });
            }
        };
    }])
    .directive('stateDiagram', ['StateDiagramHelper', function(StateDiagramHelper) {
        return {
            restrict: 'C',
            template: '<div></div>',
            scope: {
                  data: '=',
                levelsToShow: '=',
                finalDisplayed: '@'
            },
            link: function($scope, $element, $attrs) {
                  StateDiagramHelper.init($element.find('div')[0], $scope.finalDisplayed==='true');
                $scope.$watchGroup(['data', 'levelsToShow'], function(newValues, oldValues) {
                    StateDiagramHelper.update(newValues[0], newValues[1]);
                });
            }
        };
    }]);