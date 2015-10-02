angular.module('MathsQuiz', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller("MainCtrl", function($interval, $scope,
                                 $ionicScrollDelegate) {

  $scope.params = {
  };

  $scope.problems = null;

  $scope.canStart = function() {
    if (!$scope.params)
      return false;

    return $scope.params &&
      $scope.params.count &&
      (typeof $scope.params.min === "number") &&
      (typeof $scope.params.max === "number") &&
      ($scope.params.max > $scope.params.min) &&
      ($scope.params.doAdd || $scope.params.doSubtract
      || $scope.params.doMultiply || $scope.params.doDivide);
  }

  $scope.clear = function() {
    $interval.cancel($scope.problems.interval);
    $scope.problems = null;
  };

  $scope.finish = function() {
    $ionicScrollDelegate.scrollTop(false);
    $scope.problems.complete = true;
  };

  $scope.getCorrect = function() {
    if (!$scope.problems)
      return 0;

    var correct = 0;
    angular.forEach($scope.problems.list, function(item, index) {
      correct += item.answer === item.solution ? 1 : 0;
    });

    return correct;
  };

  $scope.init = function() {
    var cached = window.localStorage.getItem("ARITHMETIC_APP_PARAMS");
    var params;

    if (cached) {
      try {
        params = JSON.parse(cached);
      } catch (e) {}
    }

    if (!params) {
      params = {
        allowNegative: false,
        count: 20,
        doAdd: true,
        doDivide: false,
        doMultiply: false,
        doSubtract: true,
        max: 20,
        min: 1
      };
    }

    $scope.params = params;
  };

  $scope.next = function() {
    $ionicScrollDelegate.scrollTop(false);
    $scope.problems.index++;
  };

  $scope.previous = function() {
    $ionicScrollDelegate.scrollTop(false);
    $scope.problems.index--;
  }

  $scope.retry = function(index, ret) {
    $ionicScrollDelegate.scrollTop(false);
    $scope.problems.complete = false;
    $scope.problems.index = index || 0;
    $scope.problems.return = ret || false;
    if (!$scope.problems.return) {
      angular.forEach($scope.problems.list, function(item, index) {
        item.answer = null;
      });
    }
  };

  $scope.start = function() {
    window.localStorage.setItem("ARITHMETIC_APP_PARAMS",
                                JSON.stringify($scope.params));

    var problems = {
      complete: false,
      return: false,
      index: 0,
      list: [],
      timer: 0,
      get time () {
        var hours = Math.floor(this.timer / 3600);
        var minutes = Math.floor(this.timer / 60) % 60;
        var seconds = Math.floor(this.timer) % 60;

        return (hours ? (hours < 10 ? "0" + hours : hours) + ":" : "") +
          (minutes < 10 ? "0" + minutes : minutes) + ":" +
          (seconds < 10 ? "0" + seconds : seconds);
      }
    };

    var operators = [];
    if ($scope.params.doAdd) operators.push("+");
    if ($scope.params.doSubtract) operators.push("-");
    if ($scope.params.doMultiply) operators.push("×");
    if ($scope.params.doDivide) operators.push("÷");

    for (var i = 0; i < $scope.params.count; i++) {
      var operator = operators[$scope.random(0, operators.length)];
      var n1 = $scope.random($scope.params.min, $scope.params.max + 1);
      var n2;
      if (operator === "+") {
        n2 = $scope.random($scope.params.min, $scope.params.max + 1);
      } else if (operator === "-") {
        var max;
        if ($scope.params.allowNegative) {
          max = $scope.params.max + 1;
        } else {
          max = n1;
        }
        n2 = $scope.random($scope.params.min, max);
      } else if (operator === "×") {
        n2 = $scope.random($scope.params.min, $scope.params.max + 1);
      } else if (operator === "÷") {

      }
      problems.list.push({
        answer: null,
        operator: operator,
        n1: n1,
        n2: n2
      });

      angular.forEach(problems.list, function(item, index) {
        switch (item.operator) {
          case "+":
            item.solution = item.n1 + item.n2;
            break;
          case "-":
            item.solution = item.n1 - item.n2;
            break;
          case "×":
            item.solution = item.n1 * item.n2;
            break;
          case "÷":
            item.solution = item.n1 / item.n2;
            break;
        }
      });
    }

    $scope.problems = problems;
    $scope.problems.interval = $interval(function() {
      if ($scope.getCorrect() !== $scope.problems.list.length)
        $scope.problems.timer++;

    }, 1000);
  };

  $scope.random = function(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }

  $scope.init();
})
