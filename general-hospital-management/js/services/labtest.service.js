(function() {
    'use strict';

    angular.module('hospitalApp')
        .factory('LabTestService', ['$http', function($http) {
            var API_URL = 'http://localhost:5076/gateway/api/labtest';

            return {
                // Get all lab tests
                getAll: function() {
                    return $http.get(API_URL + '/get-all-labtest')
                        .then(function(response) {
                            return response.data;
                        });
                },

                // Search lab tests
                search: function(searchRequest) {
                    return $http.post(API_URL + '/search', searchRequest)
                        .then(function(response) {
                            return response.data;
                        });
                },

                // Create new lab test
                create: function(labTest) {
                    return $http.post(API_URL, labTest)
                        .then(function(response) {
                            return response.data;
                        });
                },

                // Update lab test
                update: function(id, labTest) {
                    return $http.put(API_URL + '/' + id, labTest)
                        .then(function(response) {
                            return response.data;
                        });
                },

                // Delete lab test
                delete: function(id) {
                    return $http.delete(API_URL + '/' + id)
                        .then(function(response) {
                            return response.data;
                        });
                }
            };
        }]);
})();
