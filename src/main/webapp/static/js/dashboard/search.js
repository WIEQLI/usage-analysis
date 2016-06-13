angular.module('dashboardApp.search', ['ae-datetimepicker', 'dashboardApp.data'])
  .controller('SearchController', ['$window', 'TimeCache', 'SessionsService', function($window, TimeCache, SessionsService) {
    var self = this;
    var dateFormat = 'YYYY/MM/DD HH:mm';

    self.startTime = TimeCache.getDefaultStart();
    self.endTime = TimeCache.getDefaultEnd();
    self.startTimeOptions = {format: dateFormat};
    self.endTimeOptions = {format: dateFormat, minDate: moment(self.startTime).add(1, 'hours')};

    self.actionsNum = 1;
    self.containsCommand = '';
    self.sessions = [];


    function getURLParams() {
        var startISO = self.startTime.toISOString();
        var endISO = self.endTime.toISOString();
        var ret = {start: startISO, end: endISO};
        TimeCache.store(startISO, endISO);
        return ret;
    }

    function getParams() {
        var ret = getURLParams();
        ret.minStatements = self.actionsNum;
        ret.containsCommand = self.containsCommand;
        return ret;
    }

    function getUrlParams() {
        var ret = '';
        var params = getParams();
        for (var name in params) {
            ret += name + '=' + params[name] + '&';
        }
        if (ret !== '')
            ret = '?' + ret.substring(0, ret.length-1);
        return ret;
    }

    self.startTimeUpdate = function() {
        self.endTimeOptions.minDate = moment(self.startTime).add(1, 'hours');
        if (self.endTime < self.endTimeOptions.minDate) {
            self.endTime = self.endTimeOptions.minDate;
        }
    };

    self.list = function() {
        SessionsService.list(getParams()).then(function(response) {
                self.sessions = response.data;
            }, function(error) {
                console.error(error);
            });
    };

    self.showStatesChart = function() {
        $window.location.href = 'a/summaries/states.html' + getUrlParams();
    };

    self.showSessionsStartedHistogram = function() {
        $window.location.href = 'a/summaries/sessions_started.html' + getUrlParams();
    };

    self.showInteractionCountingHistogram = function() {
        $window.location.href = 'a/summaries/activity.html' + getUrlParams();
    };

    self.showInteractionCountingScatterplot = function() {
        $window.location.href = 'a/summaries/activity_time.html' + getUrlParams();
    };
  }])
  .factory('TimeCache', [function() {
      return {
        getDefaultStart: function() {
          var date = localStorage.getItem('startISO');
          if (date==null) {
            return moment().startOf('day');
          }
          return moment(date);
        },
        getDefaultEnd: function() {
          var date = localStorage.getItem('endISO');
          if (date==null) {
            return moment().endOf('day');
          }
          return moment(date);
        },
        store: function(startDateISO, endDateISO) {
            // For convenience, but it is not really important if it doesn't work.
            localStorage.setItem('startISO', startDateISO);
            localStorage.setItem('endISO', endDateISO);
        }
      };
   }]);