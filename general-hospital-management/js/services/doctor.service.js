(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .service('DoctorService', DoctorService);

    DoctorService.$inject = ['$http'];

    function DoctorService($http) {
        var API_URL = 'http://localhost:5076/gateway/api/bacsi';

        var service = {
            getAll: getAll,
            getById: getById,
            create: create,
            update: update,
            delete: deleteDoctor,
            search: search
        };

        return service;

        function getAll() {
            return $http.get(API_URL + '/doctors')
                .then(handleSuccess)
                .catch(handleError);
        }

        function getById(id) {
            return $http.get(API_URL + '/' + id)
                .then(handleSuccess)
                .catch(handleError);
        }

        function create(doctor) {
            return $http.post(API_URL, doctor)
                .then(handleSuccess)
                .catch(handleError);
        }

        function update(id, doctor) {
            return $http.put(API_URL + '/' + id, doctor)
                .then(handleSuccess)
                .catch(handleError);
        }

        function deleteDoctor(id) {
            return $http.delete(API_URL + '/' + id)
                .then(handleSuccess)
                .catch(handleError);
        }

        function search(searchParams) {
            // BacSiController Search expects POST with SearchRequestDTO
            // Backend expects PascalCase: SearchTerm, PageNumber, PageSize
            var payload = {
                SearchTerm: searchParams.keyword || searchParams.searchTerm || null,
                HoTen: searchParams.hoTen || null,
                ChuyenKhoa: searchParams.chuyenKhoa || null,
                PageNumber: searchParams.pageNumber || 1,
                PageSize: searchParams.pageSize || 10
            };
            
            return $http.post(API_URL + '/search', payload)
                .then(function(response) {
                    // Search returns PagedResult inside Data
                    if (response.data && response.data.data) {
                        return response.data.data; // This is the PagedResult object
                    }
                    return response.data;
                })
                .catch(handleError);
        }

        // --- Private Helper Functions ---

        function handleSuccess(response) {
            // API returns { Success: true, Data: [...] }
            // Or sometimes direct list depending on controller.
            // Based on BacSiController: returns { Success:true, Data: [...] }
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return response.data;
        }

        function handleError(error) {
            console.error('DoctorService Error:', error);
            return Promise.reject(error);
        }
    }
})();
