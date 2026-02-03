(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .service('SurgeryService', SurgeryService);

    SurgeryService.$inject = ['$http'];

    function SurgeryService($http) {
        var API_URL = 'http://localhost:5076/gateway/api/surgery'; // Using Absolute URL to fix 404 on Live Server

        var service = {
            getAll: getAll,
            search: search,
            getById: getById,
            create: create,
            update: update,
            delete: deleteSurgery
        };

        return service;

        function getAll() {
            return $http.get(API_URL + '/get-all-surgery')
                .then(handleSuccess)
                .catch(handleError);
        }

        function search(filter) {
            return $http.post(API_URL + '/search', filter)
                .then(handleSuccess)
                .catch(handleError);
        }

        function getById(id) {
            // Check if endpoint exists, otherwise filter from getAll or search
            // Assuming there is no direct getById in controller based on previous read, 
            // but usually update requires ID so we might handle passing object directly.
            // Update: Search endpoint returns detailed objects. 
            // If strictly needed, reuse search or getAll.
            return $http.get(API_URL + '/get-all-surgery') // Fallback/Mock if specific ID endpoint missing
                 .then(function(res) {
                     return res.data.find(x => x.id === id);
                 });
        }

        function create(data) {
            return $http.post(API_URL, data)
                .then(handleSuccess)
                .catch(handleError);
        }

        function update(id, data) {
            return $http.put(API_URL + '/' + id, data)
                .then(handleSuccess)
                .catch(handleError);
        }

        function deleteSurgery(id) {
            return $http.delete(API_URL + '/' + id)
                .then(handleSuccess)
                .catch(handleError);
        }

        // --- Private Helper Functions ---

        function handleSuccess(response) {
            return response.data;
        }

        function handleError(error) {
            console.error('SurgeryService Error:', error);
            return Promise.reject(error);
        }
    }
})();
