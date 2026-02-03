(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .service('NurseService', NurseService);

    NurseService.$inject = ['$http'];

    function NurseService($http) {
        var API_URL = 'http://localhost:5076/gateway/api/yta';

        var service = {
            getAll: getAll,
            getById: getById,
            create: create,
            update: update,
            delete: deleteNurse,
            search: search
        };

        return service;

        function getAll() {
            return $http.get(API_URL + '/get-all')
                .then(handleSuccess)
                .catch(handleError);
        }

        function getById(id) {
            return $http.get(API_URL + '/get-by-id/' + id)
                .then(handleSuccess)
                .catch(handleError);
        }

        function create(nurse) {
            return $http.post(API_URL + '/create', nurse)
                .then(handleSuccess)
                .catch(handleError);
        }

        function update(id, nurse) {
            return $http.put(API_URL + '/update', nurse)
                .then(handleSuccess)
                .catch(handleError);
        }

        function deleteNurse(id) {
            return $http.delete(API_URL + '/delete/' + id)
                .then(handleSuccess)
                .catch(handleError);
        }

        function search(searchParams) {
            // Backend expects PascalCase property names
            var payload = {
                PageIndex: searchParams.pageIndex || 1,
                PageSize: searchParams.pageSize || 10,
                HoTen: searchParams.hoTen || null,
                SoDienThoai: searchParams.soDienThoai || null
            };
            
            return $http.post(API_URL + '/search', payload)
                .then(function(response) {
                    if (response.data && response.data.items) {
                        return response.data; // PagedResult
                    }
                    return response.data;
                })
                .catch(handleError);
        }

        // --- Private Helper Functions ---

        function handleSuccess(response) {
            return response.data;
        }

        function handleError(error) {
            console.error('NurseService Error:', error);
            return Promise.reject(error);
        }
    }
})();
